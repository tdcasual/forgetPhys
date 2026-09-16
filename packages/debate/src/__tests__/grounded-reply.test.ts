import { describe, expect, it } from "vitest";
import {
  StubGroundedReply,
  assembleGroundedReplyMessages,
  uncertaintyDraft,
  type GroundedReplyRequest,
  type GroundedReplyTransport,
  RulesCriticPolicy,
} from "../index";

const baseReq = (): GroundedReplyRequest => ({
  persona: {
    id: "persona-test",
    spec: "character-card-v2-inspired",
    name: "Rutherford",
    name_zh: "卢瑟福",
    charId: null,
    description: "",
    personality: "",
    scenario: "",
    system_prompt: "You are careful with evidence.",
    mes_example: [],
    bans: ["quark"],
    era: "1909-1911",
    venue_tags: ["lab-coupland"],
    modes: ["free", "hard"],
  },
  mode: "free",
  messages: [{ role: "user", content: "What did you see?" }],
  hits: [
    {
      id: "fact-1",
      store: "fact",
      tier: "primary",
      snippet: "large angle scattering observed",
      score: 1,
    },
  ],
  debateSessionId: "test-session",
  path: "short",
});

describe("assembleGroundedReplyMessages", () => {
  it("orders system persona → bans → snippets → mode → schema", () => {
    const msgs = assembleGroundedReplyMessages(baseReq());
    expect(msgs[0]?.role).toBe("system");
    const sys = msgs[0]?.content ?? "";
    expect(sys).toContain("You are careful with evidence.");
    expect(sys).toContain("quark");
    expect(sys).toContain("fact-1");
    expect(sys).toContain("Mode: free");
    expect(sys).toContain('"cite"');
    expect(msgs.some((m) => m.role === "user")).toBe(true);
  });
});

describe("StubGroundedReply cite-or-retry", () => {
  it("returns uncertainty after critic rejects K times", async () => {
    const transport: GroundedReplyTransport = {
      async complete() {
        return { text: "invented", cite: ["not-a-hit"] };
      },
    };
    const policy = new RulesCriticPolicy();
    const reply = await new StubGroundedReply().generate(
      baseReq(),
      policy,
      transport,
      { maxRetries: 2 },
    );
    expect(reply).toEqual(uncertaintyDraft("en"));
  });

  it("accepts grounded draft on first pass", async () => {
    const transport: GroundedReplyTransport = {
      async complete() {
        return { text: "We saw large angles.", cite: ["fact-1"] };
      },
    };
    const policy = new RulesCriticPolicy();
    const reply = await new StubGroundedReply().generate(
      baseReq(),
      policy,
      transport,
    );
    expect(reply.cite).toEqual(["fact-1"]);
    expect(reply.text).toContain("large angles");
  });
});
