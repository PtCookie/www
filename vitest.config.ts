/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import { coverageConfigDefaults } from "vitest/config";

export default getViteConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    coverage: {
      enabled: true,
      include: ["src/**"],
      exclude: [
        "src/**/*.astro", // exclude til container API is stable
        "src/*config.ts",
        "src/lib/**",
        "!src/lib/utils.ts",
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
});
