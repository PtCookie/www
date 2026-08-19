import { expect, test } from "@playwright/test";

// Home page under the English locale — static content, no API calls to stub, and the desktop
// `Navigation` island renders real `<a>` links suitable for a same-shell ClientRouter navigation.
const PAGE = "/en";
const STORAGE_KEY = "theme";

const preference = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.dataset.theme);
const isDark = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.classList.contains("dark"));
const stored = (page: import("@playwright/test").Page) =>
  page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);

// `astro dev`'s Vite dependency optimizer can invalidate its pre-bundle on a fresh browser's
// first request for a dep it hasn't served yet (a 504 "Outdated Optimize Dep" console error),
// which Vite's client recovers from with an automatic full-page reload. A `goto` that resolves
// right before that reload lands leaves React un-hydrated under our feet — a click on the theme
// toggle then does nothing, because the reload wipes the very listeners it just attached.
// Settling on network idle before interacting sidesteps the race; it's dev-server flakiness, not
// anything the app under test does differently in production (verified: `pnpm build` succeeds).
async function gotoReady(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

async function choose(page: import("@playwright/test").Page, label: "System" | "Light" | "Dark") {
  await page.getByRole("button", { name: /toggle theme/i }).click();
  await page.getByRole("menuitem", { name: label }).click();
}

// The page shells are static-generated and served with no per-visitor theme baked in, so it
// must never be present in the served HTML — only applied by script. Checked against just the
// `<html>` tag itself: `astro dev`/preview may inline global.css differently across modes, and
// that stylesheet's own `html[data-theme="…"]`-style rules (if any get added later) would
// otherwise false-positive a whole-document substring check.
test("the served shell carries no theme of its own", async ({ page }) => {
  const html = await (await page.request.get(PAGE)).text();
  const openingTag = html.match(/<html[^>]*>/)?.[0];

  expect(openingTag).toBeDefined();
  expect(openingTag).not.toMatch(/\bdata-theme=/);
  expect(openingTag).not.toMatch(/\bclass=/);
});

// No-flash guard. There is no API that observes "the class was set before first paint" —
// anything queryable from `page.evaluate` already runs after it — so what's asserted instead is
// the structural property that guarantees it: the theme script is a synchronous, classic,
// in-head script. If it is ever converted to a bundled `<script>`, Astro turns it into a
// deferred `type="module"` in a separate file and this fails.
test("the theme script runs synchronously in the head", async ({ page }) => {
  await page.goto(PAGE);

  expect(
    await page.evaluate(() => {
      const script = document.head.querySelector("script[data-theme-init]");
      if (!script || !(script instanceof HTMLScriptElement)) return null;
      return { parent: script.parentElement?.tagName, type: script.type, defer: script.defer, src: script.src };
    }),
  ).toEqual({ parent: "HEAD", type: "", defer: false, src: "" });
});

// Regression test for the bug this spec exists to catch: Astro's `<ClientRouter />` swap
// (astro/dist/transitions/swap-functions.js's swapRootAttributes) replaces every attribute on
// <html> with the incoming document's, and the served shell carries none of its own (asserted
// above), so a same-shell navigation used to reset the theme to light unless something
// re-applies it on `astro:after-swap` — which BaseLayout.astro's inline theme script now does.
test("an explicit Dark choice survives a client-side navigation", async ({ page }) => {
  await gotoReady(page, PAGE);
  await choose(page, "Dark");
  expect(await isDark(page)).toBe(true);

  await page.getByRole("link", { name: "Work" }).click();
  await expect(page).toHaveURL(/\/en\/work\/?$/);

  expect(await preference(page)).toBe("dark");
  expect(await isDark(page)).toBe(true);
});

// The "system" preference specifically used to be lost on navigation too (the old
// MutationObserver-based persistence could only ever write a resolved "dark"/"light"), so pin
// it down separately from the Dark case above.
test("an explicit System choice survives a client-side navigation", async ({ page }) => {
  await gotoReady(page, PAGE);
  await choose(page, "System");
  expect(await stored(page)).toBe("system");

  await page.getByRole("link", { name: "Work" }).click();
  await expect(page).toHaveURL(/\/en\/work\/?$/);

  expect(await preference(page)).toBe("system");
});

test("an explicit Dark choice survives a reload", async ({ page }) => {
  await gotoReady(page, PAGE);
  await choose(page, "Dark");

  await page.reload();

  expect(await preference(page)).toBe("dark");
  expect(await isDark(page)).toBe(true);
});
