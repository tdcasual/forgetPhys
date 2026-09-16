import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "../..");

export default defineConfig({
  resolve: {
    alias: {
      "@physics-chronicle/debate": path.join(
        repoRoot,
        "packages/debate/src/index.ts",
      ),
      "@physics-chronicle/content": path.join(
        repoRoot,
        "packages/content/src/index.ts",
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.ts", "server/**/*.test.ts"],
  },
});
