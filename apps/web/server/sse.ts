import type { ServerResponse } from "node:http";

export type SseEventName = "meta" | "delta" | "final" | "error" | "done";

export function initSse(res: ServerResponse): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
}

export function writeSse(
  res: ServerResponse,
  event: SseEventName,
  data: unknown,
): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function endSse(res: ServerResponse): void {
  writeSse(res, "done", {});
  res.end();
}
