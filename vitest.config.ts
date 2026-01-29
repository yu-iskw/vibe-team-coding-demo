import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/common/src/**/*.{test,spec}.ts"],
    exclude: ["node_modules", ".trunk", "**/*.vue"],
  },
});
