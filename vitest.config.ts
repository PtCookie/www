/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import { coverageConfigDefaults } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default getViteConfig({
  optimizeDeps: {
    // Prevents Vite from discovering `astro:transitions/client` (used by LangToggle) late,
    // which triggers a mid-run dep re-optimization & reload and makes browser tests flaky.
    // See: https://vitest.dev/guide/browser/#optimize-deps
    include: [
      "astro/virtual-modules/transitions-events.js",
      "astro/virtual-modules/transitions-router.js",
      "astro/virtual-modules/transitions-swap-functions.js",
      "astro/virtual-modules/transitions-types.js",
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/lib/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          // Inline `projects` entries auto-name themselves by array index ("1", "2", ...)
          // when `name` is omitted, making browser instance names like "1 (chromium)" unstable.
          // A fixed name keeps it predictable: "component (chromium)".
          name: "component",
          include: ["tests/components/**/*.test.tsx"],
          setupFiles: ["./tests/setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            screenshotFailures: false,
            provider: playwright(),
            instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
          },
        },
      },
    ],
    coverage: {
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
