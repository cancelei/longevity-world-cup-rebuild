import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.tsx"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/",
        ".next/",
        "src/test/",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "vitest.config.ts",
        "src/app/layout.tsx",
        "src/app/globals.css",
        "src/middleware.ts",
      ],
      thresholds: {
        // High thresholds for tested component files
        "src/components/ui/**/*.tsx": {
          branches: 80,
          functions: 80,
          statements: 80,
        },
        "src/lib/*.ts": {
          branches: 70,
          functions: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Mock server-only to allow testing server modules
      "server-only": path.resolve(__dirname, "./src/test/mocks/server-only.ts"),
    },
  },
});
