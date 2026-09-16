import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin, ViteDevServer } from "vite";
import { loadEnv } from "vite";
import { handleDebateComplete } from "./debate-complete";
import { readDebateUpstreamEnv } from "./env";

const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(pluginDir, "../../..");

/**
 * Vite middleware: POST /api/debate/complete → DeepSeek / LiteLLM (server keys only).
 */
export function debateBffPlugin(): Plugin {
  return {
    name: "forgetphys-debate-bff",
    configureServer(server) {
      applyEnv(server);
      server.middlewares.use(debateApiMiddleware());
    },
    configurePreviewServer(server) {
      applyEnv(server as unknown as ViteDevServer);
      server.middlewares.use(debateApiMiddleware());
    },
  };
}

function applyEnv(server: ViteDevServer): void {
  const mode = server.config.mode || "development";
  const loaded = loadEnv(mode, repoRoot, "");
  for (const [k, v] of Object.entries(loaded)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

function debateApiMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url?.split("?")[0] ?? "";
    if (url !== "/api/debate/complete") {
      next();
      return;
    }
    void handleDebateComplete(req, res, {
      env: readDebateUpstreamEnv(),
    }).catch((err) => {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "bff_unhandled" }));
      }
      console.error("[debate-bff]", err instanceof Error ? err.message : err);
    });
  };
}
