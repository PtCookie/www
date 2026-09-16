import { expect, test } from "@playwright/test";

// Work page under the English locale — the only route that renders `Timeline.astro`.
const WORK_PAGE = "/en/work";

// See e2e/theme.spec.ts's `beforeAll` for why this warm-up exists: `astro dev` compiles a route
// (and drags GSAP through Vite's dependency optimizer) on its first request, which is slow enough
// to make a cold `goto` flaky.
test.beforeAll(async ({ playwright }, testInfo) => {
  const context = await playwright.request.newContext({ baseURL: testInfo.project.use.baseURL });
  await context.get(WORK_PAGE);
  await context.dispose();
});

async function gotoReady(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

// Regression test for the bug this spec exists to catch: `Timeline.astro`'s intro animation sets
// every `.timeline-card` to `x: 300` before tweening back to 0, which pushes the root scroll area
// 253px wider than a 375px viewport. Rather than race the tween (see BLOCKED note in the prior
// review — a backgrounded tab throttles rAF and never reaches this state naturally, which is
// exactly what makes it worth pinning down explicitly), force every card back to that worst-case
// transform and assert the `overflow-x-clip` wrapper still reports zero overflow.
test("timeline cards never cause horizontal overflow, even mid-animation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoReady(page, WORK_PAGE);

  const overflow = await page.evaluate(() => {
    document.querySelectorAll<HTMLElement>(".timeline-card").forEach((card) => {
      card.style.transform = "translate(300px, 0px)";
    });
    // Force a synchronous reflow: some engines don't shrink the root scroll area back down
    // immediately after an inline transform changes, which would falsely pass this check.
    document.body.style.display = "none";
    void document.body.offsetHeight;
    document.body.style.removeProperty("display");
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });

  expect(overflow).toBe(0);
});

// Timeline.astro reveals each card via IntersectionObserver instead of animating all of them on
// page load, so a card below the fold shouldn't have played its entrance yet.
test("a card below the fold reveals only once scrolled into view", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoReady(page, WORK_PAGE);

  const lastCard = page.locator(".timeline-card").last();
  await expect(lastCard).toHaveCSS("opacity", "0");

  await lastCard.scrollIntoViewIfNeeded();
  await expect(lastCard).toHaveCSS("opacity", "1");
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("cards render fully visible with no animation", async ({ page }) => {
    // The `reducedMotion` context option above only guarantees CSS media-query emulation from
    // the *next* navigation on some engines — it isn't reliably in effect for the very first
    // `goto` in this browser/harness combination. Setting it explicitly before navigating closes
    // that gap deterministically instead of relying on context-creation timing.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, WORK_PAGE);

    const cards = page.locator(".timeline-card");
    await expect(cards.first()).toHaveCSS("opacity", "1");
    await expect(cards.last()).toHaveCSS("opacity", "1");
  });
});
