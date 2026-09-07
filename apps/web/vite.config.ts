import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "../..");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@physics-chronicle/lab-core": path.join(
        repoRoot,
        "packages/lab-core/src/index.ts",
      ),
      "@physics-chronicle/content": path.join(
        repoRoot,
        "packages/content/src/index.ts",
      ),
      "@physics-chronicle/ui": path.join(repoRoot, "packages/ui/src/index.ts"),
      "@physics-chronicle/debate": path.join(
        repoRoot,
        "packages/debate/src/index.ts",
      ),
    },
    dedupe: ["react", "react-dom", "three"],
  },
  server: {
    host: true,
    port: 5173,
    fs: { allow: [repoRoot] },
  },
  optimizeDeps: {
    exclude: [
      "@physics-chronicle/lab-core",
      "@physics-chronicle/content",
      "@physics-chronicle/ui",
      "@physics-chronicle/debate",
    ],
  },
});
