import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";
import {
  handleDebateComplete,
  parseGroundedReply,
  type DebateCompleteBody,
} from "../../server/debate-complete";
import {
  chatCompletionsUrl,
  readDebateUpstreamEnv,
  resolveUpstreamModel,
} from "../../server/env";

function mockReq(
  body: DebateCompleteBody,
  extras?: Partial<IncomingMessage>,
): IncomingMessage {
  const ee = new EventEmitter() as IncomingMessage & EventEmitter;
  const json = JSON.stringify(body);
  Object.assign(ee, {
    method: "POST",
    url: "/api/debate/complete",
    headers: { host: "localhost:5173", cookie: "" },
    complete: true,
    ...extras,
  });
  queueMicrotask(() => {
    ee.emit("data", Buffer.from(json));
    ee.emit("end");
  });
  return ee;
}

function mockRes(): ServerResponse & {
  statusCode: number;
  headers: Record<string, string | string[]>;
  chunks: string[];
  body: string;
} {
  const ee = new EventEmitter() as ServerResponse & EventEmitter & {
    statusCode: number;
    headers: Record<string, string | string[]>;
    chunks: string[];
    body: string;
  };
  ee.statusCode = 200;
  ee.headers = {};
  ee.chunks = [];
  ee.body = "";
  // Loose mocks — shape only needs what handleDebateComplete touches
  (ee as unknown as { writeHead: unknown }).writeHead = (
    code: number,
    headers?: Record<string, string>,
  ) => {
    ee.statusCode = code;
    if (headers) Object.assign(ee.headers, headers);
    return ee;
  };
  (ee as unknown as { setHeader: unknown }).setHeader = (
    k: string,
    v: string | string[],
  ) => {
    ee.headers[k] = v;
    return ee;
  };
  (ee as unknown as { getHeader: unknown }).getHeader = (k: string) =>
    ee.headers[k];
  (ee as unknown as { write: unknown }).write = (chunk: string | Buffer) => {
    const s = typeof chunk === "string" ? chunk : chunk.toString("utf8");
    ee.chunks.push(s);
    ee.body += s;
    return true;
  };
  (ee as unknown as { end: unknown }).end = (chunk?: string | Buffer) => {
    if (chunk) (ee as unknown as { write: (c: string | Buffer) => boolean }).write(chunk);
    ee.emit("finish");
    return ee;
  };
  return ee;
}

function parseEvents(body: string): { event: string; data: unknown }[] {
  const out: { event: string; data: unknown }[] = [];
  for (const block of body.split("\n\n")) {
    if (!block.trim()) continue;
    let event = "message";
    const dataLines: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) continue;
    out.push({ event, data: JSON.parse(dataLines.join("\n")) });
  }
  return out;
}

describe("debate BFF env", () => {
  it("defaults to DeepSeek official base + maps model", () => {
    const env = readDebateUpstreamEnv({
      DEEPSEEK_API_KEY: "test-key-not-real",
    } as NodeJS.ProcessEnv);
    expect(env.baseUrl).toBe("https://api.deepseek.com");
    expect(env.model).toBe("deepseek-chat");
    expect(env.apiKey).toBe("test-key-not-real");
    expect(chatCompletionsUrl(env.baseUrl)).toBe(
      "https://api.deepseek.com/v1/chat/completions",
    );
  });

  it("keeps LiteLLM-style model when not on DeepSeek host", () => {
    expect(
      resolveUpstreamModel(
        "http://127.0.0.1:4000",
        "forgetphys-debate",
        "forgetphys-debate",
      ),
    ).toBe("deepseek/deepseek-chat");
  });

  it("falls back to LITELLM_API_KEY", () => {
    const env = readDebateUpstreamEnv({
      LITELLM_API_KEY: "gateway-key",
      LITELLM_BASE_URL: "http://127.0.0.1:4000",
      LITELLM_MODEL: "forgetphys-debate",
    } as NodeJS.ProcessEnv);
    expect(env.apiKey).toBe("gateway-key");
    expect(env.model).toBe("deepseek/deepseek-chat");
  });
});

describe("parseGroundedReply", () => {
  it("parses fenced JSON and filters cites", () => {
    const raw =
      'Sure.\n```json\n{"text":"hello","cite":["a","evil"],"challenge_ids":["b"]}\n```';
    const draft = parseGroundedReply(raw, ["a", "b"]);
    expect(draft.text).toBe("hello");
    expect(draft.cite).toEqual(["a"]);
    expect(draft.challenge_ids).toEqual(["b"]);
  });
});

describe("handleDebateComplete", () => {
  it("streams mock SSE without calling upstream", async () => {
    const req = mockReq({
      messages: [{ role: "user", content: "hi" }],
      mode: "free",
      requestId: "req-test-1",
      allowedCiteIds: ["fact-1"],
    });
    const res = mockRes();
    await handleDebateComplete(req, res, {
      env: {
        baseUrl: "https://api.deepseek.com",
        apiKey: null,
        model: "deepseek-chat",
        modelAlias: "forgetphys-debate",
        mock: true,
      },
    });
    const events = parseEvents(res.body);
    expect(events[0]?.event).toBe("meta");
    expect(events.some((e) => e.event === "delta")).toBe(true);
    expect((events[0]?.data as { requestId: string }).requestId).toBe(
      "req-test-1",
    );
    expect(events.some((e) => e.event === "final")).toBe(true);
    expect(events.at(-1)?.event).toBe("done");
    expect(res.headers["Set-Cookie"] || res.headers["set-cookie"]).toBeTruthy();
  });

  it("errors when live key missing (no mock)", async () => {
    const req = mockReq({
      messages: [{ role: "user", content: "hi" }],
      requestId: "req-missing",
    });
    const res = mockRes();
    await handleDebateComplete(req, res, {
      env: {
        baseUrl: "https://api.deepseek.com",
        apiKey: null,
        model: "deepseek-chat",
        modelAlias: "forgetphys-debate",
        mock: false,
      },
    });
    const events = parseEvents(res.body);
    expect(events.some((e) => e.event === "error")).toBe(true);
    const err = events.find((e) => e.event === "error")?.data as {
      code: string;
      message: string;
    };
    expect(err.code).toBe("missing_api_key");
    expect(err.message).not.toMatch(/sk-/);
  });

  it("proxies streamed upstream with mocked fetch", async () => {
    const upstreamPayload =
      'data: {"choices":[{"delta":{"content":"{\\"text\\":\\"ok\\",\\"cite\\":[]}"}}]}\n\n' +
      "data: [DONE]\n\n";
    const fetchImpl = vi.fn(async () => {
      return new Response(upstreamPayload, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
    }) as unknown as typeof fetch;

    const req = mockReq({
      messages: [{ role: "user", content: "hi" }],
      requestId: "req-live",
    });
    const res = mockRes();
    await handleDebateComplete(req, res, {
      env: {
        baseUrl: "https://api.deepseek.com",
        apiKey: "test-key-not-real",
        model: "deepseek-chat",
        modelAlias: "forgetphys-debate",
        mock: false,
      },
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledOnce();
    const call = vi.mocked(fetchImpl).mock.calls[0];
    expect(String(call?.[0])).toContain("/v1/chat/completions");
    const init = call?.[1] as RequestInit;
    expect(String(init.headers && (init.headers as Record<string, string>).Authorization)).toContain(
      "Bearer test-key-not-real",
    );
    // Authorization must not leak into SSE body
    expect(res.body).not.toContain("test-key-not-real");
    const events = parseEvents(res.body);
    const final = events.find((e) => e.event === "final")?.data as {
      text: string;
    };
    expect(final?.text).toBe("ok");
  });
});
