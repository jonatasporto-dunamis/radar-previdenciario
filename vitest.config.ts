import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./tests/mocks/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    setupFiles: ["tests/helpers/vitest.setup.ts"],
    testTimeout: 15_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json", "lcov"],
      reportsDirectory: "coverage",
      include: [
        "utils/phone.ts",
        "lib/attribution/**/*.ts",
        "lib/validations/**/*.ts",
        "services/quiz/engine/**/*.ts",
        "services/quiz/navigation/**/*.ts",
        "services/quiz/progress/**/*.ts",
        "services/quiz/renderer/**/*.ts",
        "services/quiz/results/**/*.ts",
        "services/quiz/rules/**/*.ts",
        "services/tracking/**/*.ts",
      ],
      exclude: ["**/index.ts"],
      thresholds: {
        branches: 80,
        functions: 85,
        lines: 90,
        statements: 90,
      },
    },
  },
});
