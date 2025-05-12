import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
    coverage: {
      enabled: true,
      include: ["app/**"],
    },
  },
  plugins: [tsconfigPaths()],
});
