import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";

export const ANON_COOKIE = "fp_anon";

/** ADR-0005 P1b default: anon-local HttpOnly cookie (localhost may omit Secure). */
export function ensureAnonCookie(
  req: IncomingMessage,
  res: ServerResponse,
): string {
  const existing = parseCookie(req.headers.cookie)[ANON_COOKIE];
  if (existing && /^[a-zA-Z0-9_-]{8,80}$/.test(existing)) {
    return existing;
  }
  const id = randomUUID();
  const host = req.headers.host ?? "";
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]");
  const parts = [
    `${ANON_COOKIE}=${id}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 24 * 365}`,
  ];
  if (!isLocal) parts.push("Secure");
  const prev = res.getHeader("Set-Cookie");
  if (Array.isArray(prev)) {
    res.setHeader("Set-Cookie", [...prev, parts.join("; ")]);
  } else if (typeof prev === "string") {
    res.setHeader("Set-Cookie", [prev, parts.join("; ")]);
  } else {
    res.setHeader("Set-Cookie", parts.join("; "));
  }
  return id;
}

function parseCookie(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}
