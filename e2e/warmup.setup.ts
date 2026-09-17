import { expect, test } from "@playwright/test";

// One-time seed + route warm-up for the whole e2e run. This is a Playwright *setup project*
// (see playwright.config.ts): every browser project declares `dependencies: ["setup"]`, so this
// runs once before any of them instead of once per project. It used to live as a `beforeAll` in
// each spec, which re-ran it five times — and on a shared CI runner the later repeats blew the
// 30s hook budget, failing every retry of e2e/post-card.spec.ts with
// `"beforeAll" hook timeout of 30000ms exceeded`.
//
// Two distinct problems are handled here.
//
// 1. Seeding. A fresh database (CI, a new clone) only gets `.emdash/seed.json`'s collections and
//    taxonomy *definitions* from the auto-seed on first request. Sample content and taxonomy
//    terms are gated behind `includeContent`, which that auto-seed never sets (see AGENTS.md's
//    EmDash gotchas, and node_modules/emdash/src/emdash-runtime.ts's
//    `applySeed(db, seed, { onConflict: "skip" })` call). The dev-only setup bypass applies the
//    seed with content, so the sample post and its tags exist before any test looks for a card.
//
// 2. Cold route compilation. `astro dev` compiles a route on the request that actually hits it,
//    and the post list, post detail and tag pages pull in disjoint module trees — the detail
//    branch alone drags in PortableText, its toolkit/list/mark components, and Shiki via
//    Code.astro. Warming them here keeps that compile cost out of a test's assertion window.
//    `/en` and `/en/work` do the same for theme.spec.ts and timeline.spec.ts, whose
//    client-side navigations feel it even harder (there's no `goto` to absorb it, and `/en/work`
//    drags GSAP through Vite's dependency optimizer).
const SEED_ENDPOINT = "/_emdash/api/setup/dev-bypass";

// Kept in sync with .emdash/seed.json's content.posts[0] slug and taxonomies. Both of the sample
// post's tags are warmed, not just the first one in the seed file: `PostCard` renders `post.tags`
// in whatever order the EmDash query returns, which is not the seed's order — the chip
// e2e/post-card.spec.ts clicks currently resolves to /ko/tags/shell, so warming only
// /ko/tags/typescript left the route actually under test cold.
const WARM_PATHS = [
  "/ko/posts", // post list — PostCard, covers, tags
  "/ko/posts/hello-emdash", // post detail — PortableText + Shiki
  "/ko/tags/typescript", // tag archive
  "/ko/tags/shell", // ditto — same route file, but a cold first request all the same
  "/en", // theme.spec.ts
  "/en/work", // theme.spec.ts + timeline.spec.ts (GSAP)
];

// Sequentially, not `Promise.all`. Concurrent first-compiles are the trigger for an upstream
// `astro dev` + workerd bug: Astro's non-runnable dev environment falls back to a raw
// `import("file://…")` inside the worker (astro/dist/core/environment/dev-nonrunnable.js), and
// workerd kills that import once it outlives the request's I/O context —
// `Error: Promise will never complete.` in the dev server's log, a 500 (or, since dev streams,
// an aborted connection) for whoever asked. Retrying absorbs it here rather than in a test.
const WARM_ATTEMPTS = 3;

async function warm(request: import("@playwright/test").APIRequestContext, path: string) {
  let lastStatus = 0;
  for (let attempt = 1; attempt <= WARM_ATTEMPTS; attempt++) {
    const response = await request.get(path);
    lastStatus = response.status();
    if (response.ok()) return response;
  }
  throw new Error(`${path} still responded ${lastStatus} after ${WARM_ATTEMPTS} attempts`);
}

test("seed the database and warm every route under test", async ({ request }) => {
  const seeded = await request.get(SEED_ENDPOINT);
  expect(seeded.ok(), `${SEED_ENDPOINT} responded ${seeded.status()}`).toBe(true);

  for (const path of WARM_PATHS) {
    await warm(request, path);
  }

  // Fail loudly here if the seed silently applied without content: otherwise the only symptom is
  // a confusing `getByTestId("card")` timeout several tests later.
  const posts = await request.get(WARM_PATHS[0]);
  expect(await posts.text()).toContain("hello-emdash");
});
