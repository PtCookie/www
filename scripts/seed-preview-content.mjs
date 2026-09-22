#!/usr/bin/env node
// Seeds EmDash's sample content into a production preview build, for e2e (see AGENTS.md's
// Testing section and playwright.config.ts's `webServer`).
//
// e2e used to run against `astro dev`, but `astro dev` + workerd has an upstream bug where a
// non-runnable dev environment's fallback `import("file://…")` gets killed by workerd once it
// outlives a request's I/O context (`Error: Promise will never complete.`) -- it struck not just
// on cold route compiles but intermittently on already-warm routes too, triggered by the ordinary
// concurrent sub-resource requests a real page load makes (images, fonts), which no warm-up
// strategy can front-load away. A production build has none of that: everything is bundled ahead
// of time, so the dev-only fallback path this bug lives in simply isn't there.
//
// The catch: EmDash's usual e2e seeding hook, `GET /_emdash/api/setup/dev-bypass`, 403s whenever
// `import.meta.env.DEV` is false -- which is always the case for a built Worker (Vite's DEV
// reflects "was this served by the dev server", not a `--mode` flag, and is inlined as a literal
// at build time; no CLI trick makes it true for a preview build). Seed through a different,
// ungated route instead: `POST /_emdash/api/setup` is the exact endpoint the admin setup wizard
// itself calls on a real deployment's first boot (node_modules/emdash/src/astro/routes/api/setup/
// index.ts) -- its only guard is "has setup already run" (409), not dev-mode.
//
// This script starts a *bare* `astro preview` (no rebuild -- run `pnpm run build` first) in the
// background, waits for it to answer, seeds it, and then exits while leaving that server running.
// The next CI step (`pnpm run test:e2e`) finds it already up and, via playwright.config.ts's
// `reuseExistingServer: true`, reuses it instead of spawning its own.
//
// Don't point anything at the Miniflare/workerd D1 sqlite file directly (`.wrangler/state/v3/d1/
// …`) as an alternative seeding path: `emdash seed`'s CLI forces WAL mode via Node's `node:sqlite`
// on a file whose journal is actually owned by workerd's embedded SQLite engine, and the file also
// carries Cloudflare-internal `_cf_*` bookkeeping tables a foreign writer doesn't know about.

import { spawn } from "node:child_process";
import { openSync } from "node:fs";

const BASE_URL = "http://localhost:4321";
const READY_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 500;

const logFd = openSync("astro-preview.log", "a");

// `detached: true` + `unref()` + non-inherited stdio: this process (and the CI step's shell that
// runs it) can exit without taking the preview server down with it. Inheriting the current step's
// stdio instead would risk a SIGPIPE/EOF once that step's shell exits and the fd becomes invalid.
const preview = spawn("pnpm", ["exec", "astro", "preview"], {
  detached: true,
  stdio: ["ignore", logFd, logFd],
});
preview.unref();

await waitForReady();
await seed();

console.log(`[seed-preview-content] astro preview is up (pid ${preview.pid}) and content is seeded.`);

async function waitForReady() {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      // Any response at all means the server is listening -- a 404 is fine, we just need it up.
      await fetch(BASE_URL);
      return;
    } catch {
      // Connection refused while the server is still booting -- keep polling.
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
  throw new Error(`astro preview did not respond on ${BASE_URL} within ${READY_TIMEOUT_MS}ms`);
}

async function seed() {
  const response = await fetch(`${BASE_URL}/_emdash/api/setup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "E2E", includeContent: true }),
  });
  // 409 means setup already ran -- expected on a local rerun against a `.wrangler/state` left
  // over from a previous invocation, and harmless since the content is already there.
  if (!response.ok && response.status !== 409) {
    throw new Error(`POST /_emdash/api/setup failed: ${response.status} ${await response.text()}`);
  }
}
