import { expect, test } from "@playwright/test";

// Post list under the Korean locale — the route that renders PostCard with its cover, tags and
// the title's stretched link.
const POSTS_PAGE = "/ko/posts";

// The database seed and the warm-up GETs — for this route and for the post detail and tag pages
// the tests below navigate into — live in e2e/warmup.setup.ts, which the `setup` project runs
// once for the whole suite. The navigation targets themselves are read off the rendered card
// rather than hard-coded here.

// See e2e/theme.spec.ts for why settling on network idle matters under `astro dev`.
async function gotoReady(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

// The title anchor carries `after:absolute after:inset-0`, so the whole card is one target. This
// is the half that can silently regress: drop `relative` from the Card and the overlay escapes to
// the nearest positioned ancestor instead, leaving the card body dead.
test("clicking the card body navigates to the post", async ({ page }) => {
  await gotoReady(page, POSTS_PAGE);

  const card = page.getByTestId("card").first();
  const href = await card.getByRole("link").first().getAttribute("href");
  expect(href).toBeTruthy();

  // Click the brief's coordinates through the mouse rather than `locator.click()`: the brief is
  // plain text covered by the title's overlay, and Playwright's actionability check fails a
  // locator click outright once another element intercepts the point ("<a ...> intercepts pointer
  // events") — which here is the behaviour under test, not a failure. Hit-testing the raw point
  // is what a real user does.
  const brief = await card.locator("p.line-clamp-3").boundingBox();
  if (!brief) throw new Error("the card's brief has no layout box");
  await page.mouse.click(brief.x + brief.width / 2, brief.y + brief.height / 2);

  // `waitForURL`, not `expect(page).toHaveURL()`: a full-document navigation leaves `page.url()`
  // on the old URL until the new document commits, and the expect timeout is the only budget that
  // wait gets. Under `astro dev` on a CI runner an SSR response can outlast it, which failed this
  // test six ways over (firefox/webkit/Mobile Safari) with the URL still reading `/ko/posts`.
  // `waitForURL` falls back to the test timeout instead.
  await page.waitForURL(new RegExp(`${href}/?$`));
});

// The other half: the tag links sit *inside* that overlay's box, so they only stay reachable
// because the list is lifted with `relative z-10`. Without it the overlay swallows tag clicks and
// every tag silently navigates to the post instead.
test("a tag inside the card still navigates to its tag page", async ({ page }) => {
  await gotoReady(page, POSTS_PAGE);

  const badge = page.getByTestId("card").first().getByTestId("badge").first();
  const href = await badge.getAttribute("href");
  expect(href).toMatch(/\/ko\/tags\//);

  await badge.click();

  // Same reasoning as the navigation above.
  await page.waitForURL(new RegExp(`${href}/?$`));
});

// WCAG 2.5.8 (Target Size, Minimum) wants 24x24 CSS px. `badgeVariants` is shadcn-generated and
// bases the chip at `h-5` (20px); `tagLinkClass` overrides it, which a regenerated badge or a
// dropped `cn()` call would quietly undo.
test("tag chips meet the 24px minimum touch target", async ({ page }) => {
  await gotoReady(page, POSTS_PAGE);

  const badges = page.getByTestId("card").first().getByTestId("badge");
  const count = await badges.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const box = await badges.nth(i).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(24);
    expect(box?.width).toBeGreaterThanOrEqual(24);
  }
});
