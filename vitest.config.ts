import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // Source files use the automatic JSX runtime (no explicit React import),
  // matching Next.js's own transform. esbuild's built-in "automatic" mode
  // (no @vitejs/plugin-react needed) mirrors that for tests that render
  // components, e.g. ResultReport.test.tsx via react-dom/server.
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
