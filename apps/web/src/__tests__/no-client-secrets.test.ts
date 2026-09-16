import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(appDir, "../..");
const srcRoot = path.join(webRoot, "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "__tests__" || ent.name === "node_modules") continue;
      out.push(...walk(p));
    } else if (/\.(ts|tsx|js|jsx|css)$/.test(ent.name)) {
      out.push(p);
    }
  }
  return out;
}

describe("client bundle must not reference vendor keys", () => {
  it("SPA src never mentions DEEPSEEK_API_KEY or VITE_DEEPSEEK", () => {
    const files = walk(srcRoot);
    const offenders: string[] = [];
    for (const f of files) {
      const text = fs.readFileSync(f, "utf8");
      if (
        text.includes("DEEPSEEK_API_KEY") ||
        /VITE_DEEPSEEK/.test(text) ||
        /VITE_LITELLM_API_KEY/.test(text)
      ) {
        offenders.push(path.relative(webRoot, f));
      }
    }
    expect(offenders).toEqual([]);
  });

  it("git grep for sk- secrets on tracked files is empty (placeholders ok)", () => {
    // Word-ish boundary + length avoids false positives like CSS "desk-occluder".
    const repoRoot = path.resolve(webRoot, "../..");
    let out = "";
    try {
      out = execSync(
        "git grep -nE '(^|[^A-Za-z0-9])sk-[a-zA-Z0-9]{16,}' -- ':!.env' ':!*.png' ':!*.jpg' || true",
        {
          cwd: repoRoot,
          encoding: "utf8",
        },
      );
    } catch {
      out = "";
    }
    const lines = out
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .filter(
        (l) =>
          !/\[redacted\]|placeholder|example|sk-\[|sanitizeErrorMessage|no-client-secrets/.test(
            l,
          ),
      );
    expect(lines).toEqual([]);
  });
});
