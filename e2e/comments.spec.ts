import { expect, test } from "@playwright/test";

// Matches .emdash/seed.json's content.posts[0] slug — the only post a fresh database has.
const POSTS_PAGE = "/ko/posts";
const SAMPLE_POST_PAGE = "/ko/posts/hello-emdash";
const COMMENTS_ENDPOINT = "**/_emdash/api/comments/posts/*";

// Same warm-up as e2e/post-card.spec.ts: the dev-bypass seeds the sample post (and, through
// seed.json's `commentsEnabled`, turns comments on) on a fresh database, and both routes are
// compiled up front so a cold `astro dev` compile doesn't eat into a test's timeout.
test.beforeAll(async ({ playwright }, testInfo) => {
  const context = await playwright.request.newContext({ baseURL: testInfo.project.use.baseURL });
  await context.get("/_emdash/api/setup/dev-bypass");
  await Promise.all([POSTS_PAGE, SAMPLE_POST_PAGE].map((path) => context.get(path)));
  await context.dispose();
});

test("renders the localized comment list and form", async ({ page }) => {
  await page.goto(SAMPLE_POST_PAGE);

  await expect(page.getByRole("heading", { name: /^(아직 댓글이 없습니다|댓글 \d+개)$/ })).toBeVisible();
  await expect(page.getByLabel("이름")).toBeVisible();
  await expect(page.getByLabel("이메일")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "댓글" })).toBeVisible();
  await expect(page.getByRole("button", { name: "댓글 남기기" })).toBeVisible();
});

// <ClientRouter /> intercepts same-origin form submits and, without PostComments.astro's
// `data-astro-reload` tagging, turned this form into a GET navigation that dumped the comment
// into the query string and wiped the status message. Reach the post through a client-side
// navigation so the comment script is loaded by a swap rather than a full page load, the way a
// reader actually gets there. The POST is mocked so the test never writes to the database.
test("submits through EmDash's fetch handler after a client-side navigation", async ({ page }) => {
  let posted: unknown = null;
  // The router's GET navigation is async, so the URL and status message still look right for a
  // moment after a hijacked submit — assert on the navigation request itself, which the router
  // fires synchronously from its submit handler, i.e. before EmDash's mocked POST even resolves.
  const hijackedNavigations: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === SAMPLE_POST_PAGE && url.search) hijackedNavigations.push(url.search);
  });
  await page.route(COMMENTS_ENDPOINT, async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    posted = route.request().postDataJSON();
    await route.fulfill({ json: { success: true, data: { status: "pending" } } });
  });

  await page.goto(POSTS_PAGE);
  await page.getByRole("link", { name: "EmDash로 시작하는 블로그" }).click();
  await expect(page).toHaveURL(SAMPLE_POST_PAGE);

  await page.getByLabel("이름").fill("Tester");
  await page.getByLabel("이메일").fill("tester@example.test");
  await page.getByRole("textbox", { name: "댓글" }).fill("e2e comment");
  await page.getByRole("button", { name: "댓글 남기기" }).click();

  await expect(page.locator("[data-ec-comment-form]").getByRole("status")).toHaveText("댓글은 검토 후 게시됩니다.");
  expect(hijackedNavigations).toEqual([]);
  expect(new URL(page.url()).search).toBe("");
  expect(posted).toMatchObject({ authorName: "Tester", authorEmail: "tester@example.test", body: "e2e comment" });
});
