# www.ptcookie.net

Static Astro site (https://www.ptcookie.net): portfolio (Home/Work/About) plus a blog, content
authored as local markdown. React islands + shadcn/ui + Tailwind v4, bilingual (ko/en).

## Commands

```bash
pnpm dev                              # dev server on :4321
pnpm build && pnpm preview            # production build
pnpm lint                             # eslint
pnpm format                           # prettier --write .
pnpm test                             # vitest watch (unit + 3 browsers)
pnpm exec vitest run --project unit   # fast node-only pass
pnpm test:coverage                    # unit + chromium only, with coverage
```

- Component tests need browsers: `pnpm exec playwright install`.

## Architecture

- **Content pipeline**: posts are markdown files in `src/content/post/{ko,en}/*.md`, loaded by Astro's built-in
  `glob` loader (`src/content.config.ts`) into the `post` collection, validated by `src/lib/schema.ts`. Locale is a
  top-level directory (`ko`/`en`) and also a required `locale` frontmatter field acting as a discriminator, so every
  `getCollection("post")` call must filter on it. Cover images live in `src/assets/covers/{ko,en}/*` and are
  referenced from frontmatter via a relative `coverImage.url` path so Astro's `image()` schema helper can process
  them through `astro:assets` (do not point `coverImage.url` at `public/` — it needs to resolve to an
  `ImageMetadata`, not a plain URL string).
- **Routing**: all pages live under `src/pages/[lang]/`, with `getStaticPaths()` mapping over `config.locales`
  (`src/config.ts`). `astro.config.mjs` sets `prefixDefaultLocale: true`, so `/` redirects to `/ko/`. `work.astro`
  and `about.astro` sit alongside the blog routes; they (and `index.astro`) pass `wide` to `BaseLayout` for a
  `sm:max-w-5xl` container, matching the header's inner width — every other route (posts, tags, 404) stays at the
  narrower `sm:max-w-3xl` that keeps article `prose` readable.
- **UI**: `.astro` for static markup, `.tsx` React islands only where interaction is needed
  (`ModeToggle`, `LangToggle`, `Navigation`, `Hamburger`, `Pagination`, `PostCard`). `Navigation` is hydrated
  (`client:load`) because its `Link` dropdown needs a Radix trigger — it used to be static SSR-only markup, so
  don't remove the directive assuming it's decorative. `src/components/ui/*` is shadcn-generated (new-york style)
  — add components with the shadcn CLI instead of hand-writing them.
- **Theming**: Catppuccin Latte (light) / Macchiato (dark) tokens in `src/styles/global.css` `@theme`.
  `src/hooks/useTheme.ts` owns the `dark`-class toggle on `<html>`; `ModeToggle` and `Hamburger` both consume it.
  This is **not** next-themes — the project doesn't use that library. `Header.astro`'s inline `<script>` does the
  FOUC-free init from `localStorage` and persists whatever the hook writes via a `MutationObserver`.

## Conventions

- Imports use the `@/` alias **with the file extension**: `@/lib/utils.ts`, `@/components/ui/button.tsx`.
  The shadcn CLI emits extensionless `@/lib/utils` — fix that import by hand after adding a component.
- Every flat user-facing string goes into the `Translation` interface in `src/i18n/translation.ts` (both `ko` and
  `en`) and is read through `translate(lang, key)`. **Structured/list-shaped localized content** (arrays, nested
  objects — `Translation` can only hold flat strings) goes in a sibling `src/i18n/*.ts` module keyed by a stable id
  instead, resolved by a small helper in `src/lib/utils.ts`; `src/i18n/timeline.ts` + `getTimeline()` is the
  reference shape to copy. `config.menuEntry`/`linkEntry` labels are a deliberate exception and stay untranslated,
  matching the pre-existing `Home`/`Posts`/`Tags` precedent.
- Reuse `src/lib/utils.ts`: `cn`, `getAllTags`, `getTimeline`, `range`, `translate`. Don't add
  `astro:transitions/client` imports there — `tests/lib/utils.test.ts` runs in the node-environment `unit` vitest
  project, which can't resolve that virtual module. Locale-switching navigation lives in `src/lib/locale.ts`
  instead, covered behaviourally by component tests rather than a unit test.
- Code comments in English. Prettier + `.editorconfig` decide formatting (120 cols; 2 spaces, 4 in css/json).
- Conventional Commits (`feat:`, `fix:`, `test:`, `chore(deps):`).

## Testing

- `tests/lib/**/*.test.ts` → vitest `unit` project, node environment.
- `tests/components/**/*.test.tsx` → `component` project, real chromium/firefox/webkit via `@vitest/browser-playwright`,
  Testing Library + jest-dom, setup in `tests/setup.ts`.
- Coverage tracks `src/**` minus `.astro` files and `src/lib/*` except `utils.ts`.
- Playwright e2e is configured (`playwright.config.ts`, `testDir: ./e2e`, baseURL `:4321`) but no specs exist yet.

## Documentation

Look up EmDash documentation via the `emdash-docs` MCP server when you need to
verify an API, hook, config option, or pattern. Prefer the docs MCP over
assumptions from training data -- the docs reflect the current published
behaviour.

## Gotchas

- `vitest.config.ts`'s `coverage.exclude` must never contain a `"!"`-prefixed entry: `@vitest/coverage-v8`
  passes the whole array straight to picomatch's `ignore` option, and one negated entry zeroes out coverage
  for _every_ file (not just the one you meant to un-exclude), silently producing a 0/0 report. Use an
  extglob instead, e.g. `"src/lib/!(utils).ts"` to exclude everything in `src/lib` except `utils.ts`.
- Vitest's browser project (and anything that runs it — `pnpm test:coverage`, the pre-push hook) needs to
  bind a local port for Playwright's browser instances. In network-sandboxed tool runners this fails with
  `EPERM: operation not permitted ::1:<port>` — disable the sandbox for that command rather than debugging it
  as a code issue.
- `pnpm install`/`pnpm build` (and hooks that trigger it, e.g. `pre-commit` after a `package.json` change) can
  fail in sandboxed/non-TTY tool runners with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` or a lefthook
  `prepare` step `operation not permitted` error — set `CI=true` and disable the sandbox for that command
  rather than debugging it as a code issue.
- Watch for these two signals that a sandboxed `pnpm add`/`remove`/`install` silently used the wrong store
  instead of `~/Library/pnpm/store` (confirmed via `pnpm store path` returning a path under the project root,
  and an actual write there failing with `[ERR_SQLITE_ERROR] unable to open database file`): a stray
  `.pnpm-store/` directory in `git status`, or a later `pnpm install` anywhere failing with
  `ERR_PNPM_UNEXPECTED_STORE` (dependencies linked from one store, pnpm now resolving another). Neither a
  project `.npmrc` `store-dir` nor `--config.store-dir` fixes this — the sandbox denies the write outright
  regardless of what store-dir is configured, so it's not something project files can route around.
  `.claude/settings.local.json` sets `sandbox.filesystem.allowWrite: ["~/Library/pnpm/store"]` to let
  sandboxed pnpm reach the real store, but sandbox config appears to load once at session start — a change
  made mid-session may not take effect until the next session. If either signal shows up, disable the sandbox
  for the pnpm command instead of debugging further.
- `vitest.config.ts` pre-bundles the `astro:transitions` virtual modules in `optimizeDeps`, and the browser project
  is explicitly named `component`. Both comments there explain why — don't strip them, browser tests turn flaky.
- Git hooks are managed by lefthook (`lefthook.yml`), installed via the `prepare` script. `pre-commit` runs
  eslint + prettier on staged files in parallel; the **full** vitest suite across 3 browsers runs on `pre-push`,
  so pushes are slow but commits stay fast.
- `src/pages/index.astro` is intentionally empty; Astro's i18n config generates the `/` → `/ko/` redirect
  (`public/_redirects` covers the host side).
- `src/content/post/**` is excluded from `pnpm format` (see `.prettierignore`): these files were hand-restored from
  a Hashnode export whose exporter had stripped all leading whitespace from body text, silently flattening code-block
  indentation. Prettier doesn't touch markdown code fences today, but don't rely on that — the exclusion is
  intentional, keep it.
- In `astro.config.mjs`'s `markdown.shikiConfig.themes`, `light` is set to `catppuccin-macchiato` and `dark` to
  `catppuccin-latte` — this looks swapped but is intentional, chosen for code-block readability, not a bug.
- Branches: work on `main`; `production` is a release branch that `main` gets merged into.
- Only `www.ptcookie.net` is registered as a Worker custom domain in `wrangler.jsonc`. The apex `ptcookie.net`
  is a plain proxied CNAME plus a Cloudflare Redirect Rule (`ptcookie.net/*` → `www.ptcookie.net/${1}`, 301) —
  Redirect Rules run before Workers routes at Cloudflare's edge, so apex doesn't need its own Worker route.
- `astro-og` (the `og()` integration in `astro.config.mjs`) is a **dev-toolbar app only** — it doesn't generate
  OG images at build time despite the name. Per-page Open Graph data comes entirely from `BaseLayout`'s
  `title`/`description`/`ogType` props.
- GSAP animations bound outside a `.tsx` island (`Intro.astro`, `Timeline.astro`) run from a plain `<script>` on
  `astro:page-load`, and **must** call `gsap.context(fn, el).revert()` on `astro:before-swap` — without it, a
  `ClientRouter` navigation back to the same page starts another timeline on top of whatever's still running
  instead of replacing it. `Intro.astro`'s coin/text timeline is `repeat: -1`, so skipping `revert()` there
  specifically leaks one more infinite timeline per visit.
- A Radix `Sheet`/`Dialog` left open during a `ClientRouter` swap can leave `<body>` inert (`overflow: hidden`,
  `pointer-events: none`) if its own React cleanup effect doesn't get to run before the DOM is replaced.
  `Header.astro`'s `astro:after-swap` listener clears those defensively — don't remove it, and wrap any new
  in-sheet nav link in `<SheetClose asChild>` so Radix's own close path runs first.
- Third-party SVGs referenced from `about.astro`'s tech grid live in `public/logos/`, not `src/assets/`, on
  purpose: Astro (≥5.7) inlines `import x from "./x.svg"` as a component, and `graphql.svg` ships an embedded
  `<style>svg{fill:...}</style>` that would restyle every SVG on the page (including header icons) once inlined,
  while `nodejs.svg` reuses generic `id="a"`-style ids that would collide with anything else inlined on the same
  page. `src/assets/logo.svg` is fine to inline — it's the only SVG on any given page and carries no `<style>`.
- `astro:assets`' `<Image>` derives height from the source file's true (EXIF-corrected) aspect ratio when only
  `width` is given — `profile.jpg` is a portrait photo once its EXIF rotation is applied, not a landscape
  headshot, so width-only sizing produces a very tall image that blows out the layout. The About page passes
  **both** `width` and `height` plus an `object-cover` class so Sharp crops to the box instead.
