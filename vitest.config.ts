/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import { coverageConfigDefaults } from "vitest/config";

export default getViteConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
    coverage: {
      enabled: true,
      include: ["src/**"],
      exclude: ["src/*config.ts", ...coverageConfigDefaults.exclude],
    },
  },
});
