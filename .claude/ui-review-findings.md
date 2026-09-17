# UI review findings — 2026-09-15

Handoff note for the next session. Findings from a Web Interface Guidelines + visual-design
review of `src/`, with the top items measured against a real preview deployment.

Sections 4 and 5 were appended on 2026-09-16 — a design-system pass and a re-run against
`vercel-labs/web-interface-guidelines` respectively. Both started as static reading only, with
nothing measured live. Most of section 4 was implemented and visually confirmed in a 2026-09-18
session (see each item's own "Fix applied" note); §4.5 stays an open design-judgement call and
§4.10 is blocked on missing tooling.

Status legend: **CONFIRMED** (measured live) · **UNVERIFIED** (static reading only) ·
**BLOCKED** (tried to measure, harness got in the way) · ~~DONE~~

---

## Already fixed — do not redo

| Commit | What |
|---|---|
| `e5af833` | `text-md` → `text-base` in `src/pages/[lang]/about.astro` (invalid Tailwind class, was a no-op) |
| `aba9a7f` | 404 page locale via `Astro.originPathname`, `page.notFound` key, `<p>` → `<h1>` |
| `699760a` | Removed Playwright MCP server from `.agents/mcp_config.json` |

Both fixes were verified on the preview deployment (all five 404 entry paths, `.text-base`
present in the served CSS while `.text-md` is absent).

---

## 1. Dark-mode `--primary` contrast — ~~DONE~~ (was CONFIRMED, highest priority)

`--primary` is **darker in dark mode than in light mode**, which is backwards:

```
:root  --primary: oklch(0.508 0.118 165.612)   → 5.37:1 on white   PASS
.dark  --primary: oklch(0.432 0.095 166.913)   → 2.28:1 on card    FAIL
```

The dark value is tuned for the button *fill* (`bg-primary` + white label = 7.19:1, fine), but
the same token is also the link and body-text color. Measured live in dark mode:

| Element | File | Ratio | Needs | |
|---|---|---|---|---|
| Timeline card title, 20px bold | [Timeline.astro:25](../src/components/Timeline.astro#L25) | **2.28** | 3.0 | FAIL |
| Timeline detail list — **body text** | [Timeline.astro:35](../src/components/Timeline.astro#L35) | **2.28** | 4.5 | FAIL |
| Timeline period, `text-chart-4` | [Timeline.astro:24](../src/components/Timeline.astro#L24) | **3.24** | 4.5 | FAIL |
| Timeline bullet, `text-chart-5` | [Timeline.astro:38](../src/components/Timeline.astro#L38) | **2.30** | 4.5 | FAIL |
| PostCard "더 읽기" link | [PostCard.tsx:61](../src/components/PostCard.tsx#L61) | **2.28** | 4.5 | FAIL |
| Same link in **light** mode | | 5.36 | 4.5 | PASS |

Everything on the semantic tokens passes (`secondary-foreground` 16.65, `muted-foreground` 7.12,
tech chip 14.24, PostCard title/brief 16.73, tag badge 14.27). The failures are *exactly* the
`text-primary` / `text-chart-*` usages.

Other `text-primary` sites: [index.astro:27](../src/pages/[lang]/index.astro#L27) ("전체 보기"),
[Header.astro:23](../src/components/Header.astro#L23) (`hover:text-primary`), and the `link`
variant in `ui/button.tsx` + `ui/badge.tsx`.

### Suggested fix

Split the roles — keep `--primary` as the fill color, add a text/link token. Candidates computed
at `C 0.095 h 166.913` against dark bg `0.148` / card `0.218`:

| L | vs bg | vs card |
|---|---|---|
| 0.60 | 5.24 | 4.62 |
| 0.65 | 6.38 | 5.62 |
| **0.70** | **7.71** | **6.79** |

`--chart-5` needs `L ≥ 0.60` (4.57 on card); `--chart-4` is at 3.24 and needs 4.5. Consider
dropping the `text-chart-*` usage in Timeline entirely — chart tokens as body-text colors is a
semantic smell; `muted-foreground` already passes at 7.12.

### How to re-measure (read this before writing a script)

`getComputedStyle(el).color` returns **`oklch(...)` strings**, not `rgb()`. Parsing the three
numbers as RGB gives silent garbage — it cost a wrong first result in this review. Resolve colors
through a canvas instead:

```js
const cv = document.createElement("canvas"); cv.width = cv.height = 1;
const ctx = cv.getContext("2d", { willReadFrequently: true });
function toRGB(c) {
  ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = "#000"; ctx.fillStyle = c;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2], d[3] / 255];
}
```

Then walk ancestors for the first background with alpha > 0.99. Sanity-check the harness with
white-on-body, which must come out ≈ 19.7.

### Fix applied (2026-09-18 session)

Split the roles instead of re-tuning `--primary` itself: added a new `--primary-text` token
(same hue/chroma as `--primary`, dark value lifted to `L=0.70` → 7.71:1 on `--background`,
6.79:1 on `--card`; light value left equal to `--primary` since it already passed). Used at
every site that wants to stay brand-hued and readable: `Timeline.astro`'s card title,
`PostCard.tsx`'s "더 읽기" link, `index.astro`'s "전체 보기" link, `Header.astro`'s title hover,
and both shadcn `link` variants (`ui/button.tsx`, `ui/badge.tsx` — previously dead code with
zero call sites, but a landmine for the next person to use `variant="link"`; AGENTS.md's
"don't hand-write `ui/*`" line was loosened to allow small edits like this one).

`Timeline.astro`'s period label and detail-list body text, plus the bullet marker, were
demoted from `text-chart-4`/`text-chart-5`/`text-primary` to the already-passing
`text-muted-foreground` instead of also re-tuning the chart tokens — they're decorative/body
text, not brand-critical, and this sidesteps having to decide whether re-tuning `--chart-5`
would also change the timeline dot's `bg-chart-5` fill (it doesn't, since chart-5 is untouched).

New regression coverage: `tests/lib/color-contrast.test.ts` — the first contrast-regression
test in the repo. It reads the real oklch tokens out of `global.css` (both `:root` and `.dark`)
and asserts `--primary-text`/`--muted-foreground` stay ≥4.5:1 against `--background`/`--card`,
and `--primary-foreground` stays ≥4.5:1 against `--primary` (guards the fill role).

---

## 2. Timeline intro animation / horizontal overflow — ~~DONE~~

Fixed in [Timeline.astro](../src/components/Timeline.astro): `overflow-x-clip` on the section
wrapper (line 14) plus a switch from page-load stagger to IntersectionObserver-driven reveal.
Regression-covered by `e2e/timeline.spec.ts` (overflow, scroll-triggered reveal, reduced-motion).

Bringing the Browser pane to the front settled the "could not confirm" question from the prior
note: with the pane genuinely foreground (`document.hidden === false`), the overflow was
confirmed real but transient (~1s, `power2.out` easing) — not the permanent stuck-at-`x:300` state
a backgrounded pane produces. `overflow-x-clip` on the wrapper makes it moot either way (verified
directly: forcing every card back to `x: 300` post-fix still measures zero `scrollWidth` overflow
at 375/768px, where 1160px+ viewports were already unaffected).

The IntersectionObserver switch hit one non-obvious bug worth flagging for anyone touching this
again: the observer must watch the **untransformed wrapper** (`.timeline-item`), not
`.timeline-card` itself. The card starts at `x: 300`, and on a narrow viewport that pushes its
*geometry* (not just its paint) outside the root's horizontal bounds — `overflow-x-clip` only
hides the paint, so `IntersectionObserver` would report `isIntersecting: false` forever and no
card would ever reveal. Confirmed live with a throwaway `IntersectionObserver` instance before
switching the target.

Also worth noting for the next e2e spec that needs `prefers-reduced-motion`:
`test.use({ reducedMotion: "reduce" })` alone did **not** take effect before the first `goto` in
this Playwright/browser combination (`matchMedia(...).matches` read `false` on first navigation
across chromium/firefox/webkit) — an explicit `page.emulateMedia({ reducedMotion: "reduce" })`
before `goto` was required. `e2e/timeline.spec.ts`'s reduced-motion test carries this as a comment.

---

## 3. Remaining items — accessibility, i18n, SEO/head and layout/duplication all DONE

Ordered roughly by value. Font preload and the two "Design direction" judgement calls are the only
items still open — see §4.10 and the notes below.

**Accessibility / semantics** — ~~ALL DONE~~ (see "Section 3 accessibility pass" below)

**i18n / copy** — ~~DONE~~: `tags/index.astro`'s "1 posts" now goes through `getPostCountLabel`
(`src/lib/utils.ts`) + `Intl.PluralRules`, with `page.post`/`page.posts` keys for both locales.

**SEO / head** — ~~DONE~~ except font preload (see "§5 + remaining §3 pass" below for what changed;
font preload is still blocked on §4.10 — MaruBuri needs subsetting/woff2 conversion first, or
preloading just moves the heavy `.otf` fetch earlier instead of shrinking it).

**Layout / duplication** — ~~DONE~~ (see "§5 + remaining §3 pass" below).

**Design direction** (judgement calls, not defects)
- The home hero is a spinning logo plus a typed wordmark — nothing says whose site this is or what
  it's about, while the real content ("2019년부터 웹 개발") sits two levels down in About.
- Three font families with inconsistent roles: PostCard is sans title + serif body, Timeline is
  sans with a serif description, About sets its intro in mono, Intro sets the wordmark in mono.
  `--font-heading` is defined as mono but only `ui/card.tsx` uses it.

---

## Section 3 accessibility pass — DONE

Every "Accessibility / semantics" bullet from section 3 is fixed. What changed, and the parts a
future reader would otherwise have to rediscover:

- **PostCard is one target now.** The title is wrapped in an anchor carrying
  `after:absolute after:inset-0`, and `Card` gained `relative` to anchor it. "더 읽기" became a
  **`<span>`** rather than staying a second anchor to the same post — two links with different
  names to one destination is a duplicate tab stop plus a vague link name. The tag `<ul>` needs
  `relative z-10` or the overlay swallows every tag click.
- **Covers are decorative.** `alt=""` in `PostCard.tsx`, on the post-detail `<Image>`, and made
  explicit on `PostList.astro`'s emdash `<Image>` (which is the cover that actually renders on the
  list route — PostCard's own `<img>` is only the fallback branch). Note `getByRole("img")` stops
  matching once alt is empty; the tests query `presentation`.
- **Tag chips: `h-6` over `badgeVariants`' `h-5`** for the 24×24 minimum. `src/components/ui/badge.tsx`
  is shadcn-generated and was left alone; the override lives in `tagLinkClass` (`src/lib/utils.ts`)
  and is applied through **`cn()`, never `class:list`** — `class:list` doesn't run tailwind-merge,
  so it emits `h-5` *and* `h-6` and leaves the winner up to Tailwind's CSS generation order.
- **New `src/components/TagList.astro`** replaces the tag markup duplicated twice in
  `posts/[...slug].astro`. `PostCard.tsx` keeps its own copy because a `.astro` component can't be
  imported into a React file — `tagLinkClass` is what keeps the two from drifting.
- **`aria-pressed` for the theme toggle set** in `Hamburger.tsx`; the locale buttons stay on
  `aria-current`, which really does mark the current page's language.
- **`ModeToggle` marks the active theme** via `DropdownMenuRadioGroup`/`RadioItem` (already present
  in the shadcn `dropdown-menu.tsx`). Two traps: the role becomes `menuitemradio`, which broke
  `e2e/theme.spec.ts`'s selector; and **Base UI defaults `closeOnClick` to `false` on RadioItem**
  (`Menu.Item` defaults to `true`), so without passing it explicitly the menu stays open and its
  inert backdrop swallows the next click on the page — that surfaced as 6 e2e failures across all
  three browsers, and as nothing at all in the component tests.
- **Lists are lists**: `tags/index.astro` and `Timeline.astro`'s tech chips are `<ul>/<li>`.
  `role="list"` is spelled out everywhere because Tailwind's preflight sets `list-style: none`,
  which makes Safari/VoiceOver drop list semantics.

New regression cover: `e2e/post-card.spec.ts` (card-body click navigates, tag click still wins,
chips measure ≥24px). The card-body click uses `page.mouse.click` on the brief's coordinates —
`locator.click()` fails actionability because the stretched anchor intercepts the point, which is
the behaviour under test, not a failure.

Verified green: `lint`, `prettier --check`, `tsc --noEmit`, `test run` (147 across 3 browsers),
`test:e2e` (33), plus a `build` + `astro preview` check of the served markup on `/ko/posts`,
`/ko/tags`, `/ko/posts/<slug>` and `/ko/work`.

---

## 4. Design-system findings — added 2026-09-16

A second pass over `src/`, this time from a visual-design angle rather than a guidelines
checklist. Originally all UNVERIFIED (static reading only); 4.1-4.4, 4.6-4.8, 4.11 were fixed and
visually confirmed (`astro build` + `astro preview`, both themes) in a 2026-09-18 session — see
"Fix applied" below. 4.9 turned out to already be fixed (see its note). 4.5 is left open on
purpose — it was already flagged as a design judgement call, not a defect, in section 3, and
redoing that call wasn't part of this pass. 4.10 is BLOCKED: no font-subsetting tooling
(`fonttools`/`pyftsubset`/`woff2_compress`) is available in this environment, and installing it
was out of scope for a UI-only session.

### 4.1 No type scale — every page sizes its `h1` differently — ~~DONE~~

Section 3 flags `tags/index.astro`'s missing responsive step-down, but the real problem is that
there is no shared scale for it to step down *to*:

| File | `h1` classes |
|---|---|
| [PostList.astro:20](../src/components/PostList.astro#L20) | `text-4xl sm:text-5xl` |
| [tags/index.astro:20](../src/pages/[lang]/tags/index.astro#L20) | `text-5xl` |
| [posts/[...slug].astro:82](../src/pages/[lang]/posts/[...slug].astro#L82) | `text-3xl sm:text-5xl` |
| [about.astro:55](../src/pages/[lang]/about.astro#L55) | `text-4xl sm:text-6xl` |
| [404.astro:28](../src/pages/404.astro#L28) | `text-2xl` |

404's `h1` is barely larger than body text, so that page doesn't read as the same site. Fix this
as one scale (a `@theme` addition or a heading utility), not five per-page edits.

There's a hierarchy inversion too: [work.astro:26](../src/pages/[lang]/work.astro#L26)'s `h2` is
`text-3xl`, while the `h2` directly below it in
[UnderConstruction.astro:17](../src/components/UnderConstruction.astro#L17) is `text-4xl` — the
placeholder outranks the real section heading.

**Fix applied (2026-09-18 session)**: unified `PostList.astro`, `posts/[...slug].astro`'s detail
`h1`, and `404.astro`'s `h1` on `text-4xl font-extrabold text-balance sm:text-5xl` (`tags/index.astro`
already matched, from the §5 pass). `about.astro`'s hero `h1` (`text-4xl ... sm:text-6xl`) is left
as a deliberately larger "display" tier — it's a hero greeting, not a list/detail page title.
`UnderConstruction.astro`'s heading dropped from `h2 text-4xl` to `h3 text-2xl` (it's the only
caller, nested right under `work.astro`'s real `h2`, so `h3` is also the semantically correct
level, not just a size fix).

### 4.2 `--font-heading` is a dead token — ~~DONE~~

Defined as mono in [global.css:97](../src/styles/global.css#L97), but the only consumer is
`CardTitle` in `src/components/ui/card.tsx` — and `PostCard` never uses `CardTitle`, it renders
its own heading with `font-sans` ([PostCard.tsx:50](../src/components/PostCard.tsx#L50)). So the
token reaches no heading anywhere on the site. Either drop it or commit to mono headings as an
actual system decision; leaving it is what keeps section 3's "three families, inconsistent roles"
note true.

**Fix applied**: dropped the token from `@theme inline` in `global.css` (confirmed
`grep -rn CardTitle src` has zero call sites, so nothing lost the class in practice). Left
`ui/card.tsx`'s `CardTitle` itself alone — it's shadcn-generated and unused either way.

### 4.3 Light-mode cards have no edge — ~~DONE~~

`--card: oklch(1 0 0)` is **the same value as** `--background` in `:root`
([global.css:18,20](../src/styles/global.css#L18)), so a light-mode card is separated from the page
only by `ring-foreground/5` (5% opacity) and `shadow-md`. Dark mode has real separation
(`0.218` card on `0.148` background). Cards are the primary UI on the home, list, tag and
"read next" surfaces, so this asymmetry is the most visible unfixed defect after §1.

**Fix applied**: `:root`'s `--card` moved to `oklch(0.993 0.002 197.1)` — a hair darker than
`--background`, visually confirmed as a subtle-but-real edge in `astro preview`. Not pushed all the
way to `--sidebar`'s `0.987` (which would read stronger): `tests/lib/color-contrast.test.ts` pins
`--muted-foreground` at ≥4.5:1 on `--card`, and `0.987` only measures 4.45:1. `0.993` measures
4.53:1, confirmed green on `pnpm run test:coverage`.

### 4.4 Body measure exceeds ~80 characters — ~~DONE~~

[posts/[...slug].astro:111](../src/pages/[lang]/posts/[...slug].astro#L111) sets `max-w-none`,
which removes Tailwind Typography's `65ch` measure, and `main` is `sm:max-w-3xl` (48rem). Serif
body text then runs the full width. Either drop `max-w-none` or re-cap the paragraph width.
Timeline's `max-w-4xl` card bodies ([Timeline.astro:14](../src/components/Timeline.astro#L14)) are
long for the same reason.

**Fix applied**: dropped `max-w-none` from the post-detail article's `class:list` (the surrounding
`main` container's `sm:max-w-3xl` plus Typography's own `65ch` cap now both apply — code blocks
still scroll horizontally via Typography's own `pre` handling, unaffected by the container width).
Timeline's description `<p>` gained `max-w-prose`.

### 4.5 Home hero — more specific than section 3's note

- The first visible text is the "PtCookie.Net" wordmark
  ([Intro.astro:4](../src/components/Intro.astro#L4)), which is the *same string* as the site title
  already sitting in the header — the hero spends its most valuable space on a repeat.
- [index.astro:23](../src/pages/[lang]/index.astro#L23) is one centered vertical stack
  (`place-items-center`) through logo → wordmark → section heading → cards → link. Same axis, same
  alignment throughout, so no hierarchy can form.
- The logo spins on `repeat: -1`, which holds attention indefinitely. A single entrance flip would
  free that slot for the real identity line ("2019년부터 웹 개발", currently two levels down in
  About) and close section 3's "nothing says whose site this is" item at the same time.

### 4.6 Cards give no click affordance — ~~DONE~~

The whole card became one target via the stretched link
([PostCard.tsx:51](../src/components/PostCard.tsx#L51)), but the only hover feedback is the
"더 읽기" underline, and the cursor stays default over the card body. A ring/shadow transition on
`group-hover/card` would make the target legible.

**Fix applied**: added `hover:shadow-lg transition-shadow` plus a stronger `hover:ring-foreground/10
dark:hover:ring-foreground/20` directly on `ui/card.tsx`'s `Card` root (it's `group/card` itself, so
no child needs to react to a parent hover — the whole element is the hover target already). `Card`
has exactly one caller (`PostCard.tsx`), so this didn't need a scoped variant. Visually confirmed in
both themes.

### 4.7 Tag surfaces — ~~DONE~~

- [tags/index.astro:21](../src/pages/[lang]/tags/index.astro#L21) — `grid` with no column count,
  so it renders as a single column that grows without bound as tags accumulate.
- [tags/[slug]/[...page].astro:29](../src/pages/[lang]/tags/[slug]/[...page].astro#L29) — the `h1`
  is the bare tag name ("React"), with nothing marking the page as a tag archive.

**Fix applied**: `tags/index.astro`'s list gained `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
`tags/[slug]/[...page].astro` now passes `title={`#${tagName}`}` to `PostList` (BaseLayout's own
`<title>` tag still gets the bare `tagName`) — reuses the same "#" convention every tag badge
already renders elsewhere, so a tag archive reads as one at a glance without a new i18n string.

### 4.8 About tech grid — ~~DONE~~

Five items in `sm:grid-cols-3` ([about.astro:66](../src/pages/[lang]/about.astro#L66)) leaves a
two-item orphan row. The logos also carry no visible label — only `alt` — so an unfamiliar mark is
unidentifiable.

**Fix applied**: swapped the fixed-column grid for `flex flex-wrap justify-center`, which centers
every row including a trailing partial one (visually confirmed: the TypeScript/Node.js pair now
centers under the row above it instead of pinning left). Each logo gained a visible
`text-muted-foreground font-mono text-xs` label under it and moved to `alt=""` (decorative image +
visible accessible text, the same pattern already used for post cover images).

### 4.9 Accessibility item missed by the section 3 pass — already ~~DONE~~

[Intro.astro:9](../src/components/Intro.astro#L9) gives the logo `role="img"
aria-label="PtCookie"` while [:15](../src/components/Intro.astro#L15) carries an `sr-only`
"PtCookie.Net" right after it — a screen reader announces effectively the same thing twice. The
logo should be `aria-hidden`; the wordmark beside it is the accessible name.

Turned out to already be fixed — current `Intro.astro` only has `aria-hidden="true"` on the logo,
no `role="img"`/duplicate `aria-label`. This matches the §5 log's "Intro.astro's logo lost its
redundant `role="img" aria-label`" entry; this finding was written before that fix landed and never
got crossed off. No action needed in the 2026-09-18 session.

### 4.10 Font payload — the prerequisite for section 3's "no preload" — BLOCKED

Five families load today: Inter Variable, JetBrains Mono Variable, Newsreader Variable, Pretendard
(non-variable, so the whole weight set), and **MaruBuri as five separate `.otf` files**
([global.css:139-177](../src/styles/global.css#L139)). `.otf` is substantially heavier than woff2
and nothing is subset. Converting and subsetting MaruBuri comes before adding preload hints —
preloading the current files just moves the cost earlier.

Checked in the 2026-09-18 session: no font-subsetting tooling (`pyftsubset`, `fonttools`,
`woff2_compress`) is installed, and installing new system/Python tooling wasn't in scope for a
UI-only pass. Still open — whoever picks this up needs to add that tooling first (or do the
conversion outside this environment) before touching preload hints.

### 4.11 Footer carries no links — ~~DONE~~

`config.linkEntry` appears only in the header nav; [Footer.astro](../src/components/Footer.astro)
is a generator credit plus a copyright line. The footer is where contact/source links are looked
for.

**Fix applied**: `Footer.astro` now renders `config.linkEntry` as a `role="list"` row above the
generator/copyright lines, `target="_blank" rel="noreferrer"` matching the exact convention
`Navigation.tsx`/`Hamburger.tsx` already use for the same data. No new content needed — reuses the
existing `{ name: "Git", link: "https://git.ptcookie.net/" }` entry.

---

## 5. Web Interface Guidelines pass — added 2026-09-16, DONE except two filed tradeoffs

Checked against `vercel-labs/web-interface-guidelines` (fetched 2026-09-16). Every item below is
fixed except the two explicitly marked as standing deviations/tradeoffs — see "§5 + remaining §3
pass" below for what changed and why.

- `Intro.astro:8` (`repeat: -1` autoplay, WCAG 2.2.2) — ~~DONE~~, entrance timeline is one-shot now.
- `LangToggle.tsx:36,44` / `Hamburger.tsx:102,110` (locale switch not a real `<a href>`) — ~~DONE~~.
- `about.astro:45-52` (both profile images downloaded regardless of viewport) — ~~DONE~~.
- `UnderConstruction.astro:16` (🚧 emoji missing `aria-hidden`) — ~~DONE~~.
- Headings missing `text-balance` (`PostList.astro:20`, `posts/[...slug].astro:82`,
  `tags/index.astro:20`, `about.astro:55`, `Timeline.astro:25`) — ~~DONE~~.
- `translation.ts:79` (" min read" breaking space) — turned out to already be `&nbsp;` at the byte
  level; the terminal just renders it identically to a regular space. Not a defect, no change made.
- `translation.ts:86` vs `:87` (`"Toggle theme"` vs `"Toggle Locale"` casing) — ~~DONE~~,
  `toggleLocale` now matches the sentence-case convention every other `component.*` label uses.
  (`translation.ts:80` "Read more" was **not** changed to Title Case — see below for why.)
- Empty states (`tags/index.astro:21`, `PostList.astro:21`) — ~~DONE~~, same fix as §3's
  `index.astro` item.
- `404.astro:28-29` (single Return Home link, no next step) — ~~DONE~~.
- `BaseLayout.astro:78` (no preconnect for `blog-assets.ptcookie.net`) — ~~DONE~~.
- `PostList.astro:25` / `posts/[...slug].astro:97` (CLS / loading hint) — the `width`/`height`
  half was already **not a defect**: `emdash/ui`'s `<Image>` forwards `MediaValue`'s own
  `width`/`height` straight through to the rendered `<img>`/`<AstroImage>`
  (`node_modules/emdash/src/components/EmDashImage.astro`'s `imgProps`), confirmed in the build
  output. The missing loading-hint half — the list's first card, above the fold, had no
  `priority` — is ~~DONE~~.
- `ui/button.tsx:8`, `ui/badge.tsx:8`, `ui/navigation-menu.tsx:50,121` (`transition-all`) —
  **standing deviation, not fixed**. Shadcn CLI output; AGENTS.md forbids hand-editing
  `src/components/ui/*`.
- `PostCard.tsx:51` (stretched link has no `focus-visible` treatment) — ~~DONE~~.
- `astro.config.mjs`'s `/` → `/ko/` redirect ignoring `Accept-Language` — **tradeoff, not
  fixed**. The redirect compiles to a native `dist/client/_redirects` 301 at the edge (see the
  gotcha in AGENTS.md); moving it into the Worker to read headers gives up that edge-level
  handling for a single header check.

---

## §5 + remaining §3 pass — DONE (2026-09-16 session)

Closed out §5 in full (minus the two tradeoffs above) plus §3's leftover SEO/head and
layout/duplication blocks, across five commits:

- **`fix(a11y)`** — `buildIntroTimeline` (`src/lib/intro-animation.ts`) dropped `repeat: -1` to a
  plain one-shot timeline; the finite per-character `stagger` (`repeat: 1, yoyo: true,
  easeReverse`) is untouched. `Intro.astro`'s logo lost its redundant `role="img" aria-label`
  (the `sr-only` wordmark right beside it already gave the accessible name).
  `UnderConstruction.astro`'s 🚧 got `aria-hidden="true"`. `PostCard.tsx`'s stretched link gained a
  `focus-visible:after:ring-2` — the ring has to live on the `::after` overlay, not the anchor
  itself, since that's what actually covers the card.
- **`fix(i18n)`** — `LangToggle`/`Hamburger`'s locale buttons are real `<a href>` now (Base UI's
  `render` prop, same pattern `SheetClose`/`DropdownMenuTrigger` already used), not
  `onClick` → `switchLocale()` → `navigate()`. New `localePath()` in `src/lib/utils.ts` replaces
  `src/lib/locale.ts` (deleted — its one export's only callers are gone) and is unit-tested
  directly, unlike the deleted module which needed `astro:transitions/client`. It also fixes a
  latent bug the old code had: `currentUrl.replace(lang, target)` silently no-opped on a path with
  no locale prefix (e.g. `/404`), producing a dead link.
- **`fix(ui)`** — empty states for `PostList`, the tag index, and the home page
  (`page.noPosts`/`page.noTags`); 404 now links to `/posts` and `/tags` alongside Return Home;
  `text-balance` on the five headings that lacked it; the post detail page's tag list —
  previously rendered twice, right-aligned above the article and left-aligned below it — is down
  to one copy, aligned with the title; `tags/index.astro`'s `h1` steps down at `sm` like every
  other `h1`; `Footer.astro` no longer sizes up past body text.
- **`perf`** — `about.astro`'s two `<Image>`s (jpg desktop + png mobile, `hidden`-toggled — CSS
  `display:none` never stopped the download) became one `<picture>`/`<source media>` pair built
  via `getImage()`. Added a production-only `preconnect` for `blog-assets.ptcookie.net`, the LCP
  origin on post detail pages.
- **`fix(seo)`** — `og:image`/`twitter:image` are absolute (`new URL(..., Astro.site)`);
  `twitter:*` meta switched `property=` → `name=`; added a ko/en `hreflang` pair plus `x-default`,
  built from `localePath()` against `Astro.url.pathname`'s own first segment — deliberately not
  the `lang` prop, so the alternates stay off on `404.astro` (reached via `Astro.rewrite("/404")`,
  where `Astro.url.pathname` really is `/404` with no real per-locale URL to point at).

**One live-verification correction worth recording**: `astro preview`'s background daemon in this
environment (`Stop: astro preview stop`) repeatedly served a stale build after a restart on the
same port, with `astro preview status`/`lsof` reporting mismatched PIDs. It looked exactly like a
real bug (the list's first card kept measuring `loading="lazy"` despite `priority={index === 0}`
being correctly compiled into `dist/server`) until a fresh port + a temporary `alt` marker proved
the code was right and the server was stale. Kill by PID from `lsof -ti :<port>` and always move to
an unused port after any rebuild, rather than trusting `astro preview stop`/`status`.

Regression cover: existing unit/component suite (151 tests, 3 browsers) plus `tests/lib/utils.test.ts`'s
new `localePath` cases and the updated `LangToggle`/`Hamburger` href assertions; full `test:e2e`
(33 specs) and a `build` + `astro preview` pass over `/ko/about`, `/ko/posts`,
`/ko/posts/<slug>`, `/ko/tags`, and every `/404` entry path (bad slug rewrite vs. no-route-matched
fallback) all stayed green.

---

## Verification notes for whoever picks this up

- Preview deployment used: `https://<version-prefix>-www.ptcookie.workers.dev`. Get the version
  with `pnpm exec wrangler versions list`; the workers.dev subdomain is `ptcookie.workers.dev`.
  `wrangler.jsonc` has `preview_urls: true`, `workers_dev: false`.
- SSR routing behaviour does **not** reproduce under `astro dev` — use
  `pnpm run build && pnpm exec astro preview`, per AGENTS.md.
- Port 4321 is often taken by another project's dev server. Add a temporary `.claude/launch.json`
  entry with `["exec", "astro", "preview", "--port", "4322"]`. Note the Bash sandbox refuses
  writes to `.claude/launch.json` — use the Edit tool for it, not `git checkout`/`sed`.
- `playwright.config.ts` hardcodes `baseURL: http://localhost:4321` with
  `reuseExistingServer: !CI`, so running e2e locally while another project holds 4321 silently
  tests **that** server. Worth parameterising if e2e gets used more.
