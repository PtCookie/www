import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. Deliberately not raised: the e2e suite runs against
   * `astro dev`, and concurrent cold route compiles are what trips the upstream workerd
   * hanging-import bug documented in e2e/warmup.setup.ts. */
  workers: process.env.CI ? 1 : undefined,
  /* 30s (the default) is too tight for an SSR route rendered by `astro dev` inside workerd on a
   * shared CI runner. */
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://localhost:4321",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    /* Seeds the database and warms every route once for the whole run — see e2e/warmup.setup.ts.
     * A setup project rather than `globalSetup` so it reports, retries and traces like any other
     * test, and so a failure here skips the dependent projects instead of erroring opaquely.
     * `*.setup.ts` doesn't match the default `testMatch`, so the browser projects ignore it
     * without needing a `testIgnore`. Its own timeout covers a cold `astro dev` compiling every
     * warmed route from scratch. */
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      timeout: 180_000,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      dependencies: ["setup"],
    },

    /* Test against minor browsers on CI. */
    ...(process.env.CI
      ? [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
            dependencies: ["setup"],
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
            dependencies: ["setup"],
          },
          {
            name: "Mobile Safari",
            use: { ...devices["iPhone 12"] },
            dependencies: ["setup"],
          },
        ]
      : []),

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    env: { ASTRO_DEV_BACKGROUND: "0" },
    /* A cold `astro dev` has to boot workerd and run Vite's dep optimizer before it answers;
     * 60s (the default) is not always enough on a shared CI runner. */
    timeout: 180_000,
    /* Only stderr is piped by default, which left past CI failures with two stack traces and no
     * surrounding request log. The dev server's output is the first thing worth reading when the
     * suite goes red. */
    stdout: "pipe",
  },
});
