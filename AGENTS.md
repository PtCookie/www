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
  (`src/config.ts`). `astro.config.mjs`'s top-level `redirects` sends `/` to `/ko/`; `i18n.routing` is deliberately
  left unset (default `prefixDefaultLocale: false`) — see the gotcha below. `work.astro`
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
- `astro.config.mjs`'s Cloudflare adapter is gated: `adapter: process.env.VITEST ? undefined : cloudflare()`.
  Without the guard, `vitest.config.ts`'s `getViteConfig` drags the adapter's Vite plugin into every vitest run,
  and the Cloudflare plugin's worker-environment validation rejects the `resolve.external` Node-builtins list
  Vitest's own SSR test environment sets — `vitest` crashes on startup (no tests even run). Keep the guard if you
  touch either config. `output` carries the identical `process.env.VITEST ? "static" : "server"` guard for the
  same reason — an SSR `output` with no adapter throws `AdapterSupportOutputMismatch`, so the two must flip
  together. The `emdash()` integration in `integrations` is guarded the same way: it needs server output and a
  database connection at config-eval time, neither available under Vitest's SSR test environment.
- `emdash()`'s `database`/`storage` config uses Cloudflare D1/R2 bindings (`d1({binding:"DB"})`,
  `r2({binding:"MEDIA"})`) in **both** dev and prod, not EmDash's suggested local dev driver
  (`sqlite({url:"file:./data.db"})` + `local()` filesystem storage, which needs `better-sqlite3`). `astro dev`
  here runs the real Cloudflare Vite plugin (workerd), which has no Node filesystem and cannot load native N-API
  addons — `better-sqlite3` crashes dev with `Internal server error: module is not defined` the moment EmDash's
  middleware touches it. D1/R2 bindings are emulated locally by the Vite plugin without any native code, so one
  config works unchanged in both environments; `wrangler.jsonc`'s `d1_databases[0].database_id` is the
  real provisioned production database (`www-db`), used for both local D1 emulation and the deployed
  Worker — not a placeholder.
- EmDash 0.33.0 has no `emdash.config.ts` / `defineCollection` API — the content model is defined entirely by
  `.emdash/seed.json` (schema: `node_modules/emdash/src/seed/types.ts`), which the integration inlines into a
  virtual module at build time (workerd has no filesystem to read it from at runtime). **It is applied exactly
  once**, on the first request against an empty database with setup not yet completed — editing `seed.json` and
  redeploying does nothing to an already-bootstrapped site. Evolving a live site's schema goes through the admin
  panel or `emdash schema` CLI instead, and `emdash export-seed` is the way back into version control afterward.
  Resetting local state to re-apply an edited seed means deleting `.wrangler/state/v3/{d1,r2}` — this also
  discards the local passkey and any local content, so it's a real decision, not a cache clear. `.emdash/seed.json`
  is committed; `.emdash/types.ts` and `.emdash/schema.json` (both written by `emdash types`) are gitignored.
- Two EmDash-managed taxonomy definitions, `category` (hierarchical) and `tag` (flat), are seeded unconditionally
  by a core database migration (`node_modules/emdash/src/database/migrations/006_taxonomy_defs.ts`) on every fresh
  install, **before** `seed.json` is applied — independent of whether `seed.json` declares them. Taxonomy
  definition `name` is globally unique, so a `seed.json` taxonomy named `tag` collides with the migration's row and
  is silently skipped (its custom `label`/`labelSingular` never take effect; the migration's English "Tags"/"Tag"
  wins). This project doesn't use categories, so the `category` definition is inert cruft that shows up empty in
  the admin sidebar — there is no API/CLI in 0.33.0 to rename or delete a taxonomy _definition_ (only terms have
  update/delete endpoints), so it can't be cleaned up. None of this affects the terms themselves: `tag` terms
  seeded via `seed.json` are created correctly with proper per-locale `translationGroup` linking — only the
  taxonomy definition's own display label is wrong, which is admin-UI cosmetic only (the public site reads term
  `slug`/`label`, never the definition's label).
- `src/content/post/{ko,en}/*.md` and `src/assets/covers/{ko,en}/*` are migrated into EmDash D1/R2 by
  `scripts/migrate-content.mjs` (`node scripts/migrate-content.mjs [--url <base>] [--dry-run] [--force]`), not
  `emdash content create`. EmDash's own `markdownToPortableText` (`emdash/client`) — which `EmDashClient.create()`
  runs automatically over any `portableText` field given a string — is a line-by-line parser: a paragraph wrapped
  across multiple source lines becomes one block per line, a code fence quoted inside a `>` blockquote leaks its
  fence markers into the quoted text as literal characters, and only `_em_` is recognized, not `*em*` (this repo's
  posts rely on all three). `scripts/lib/markdown-to-portable-text.mjs` walks a real markdown AST
  (`mdast-util-from-markdown`, CommonMark only — the corpus has no tables/strikethrough/task-lists) instead, and
  the migration script passes the resulting Portable Text array directly rather than a markdown string, since
  `convertDataForWrite` only runs the built-in converter on string values and leaves arrays untouched. The script
  is idempotent (skips a `(collection, slug, locale)` that already exists; `--force` updates instead) so re-running
  it against a partially- or fully-migrated instance, local or production, is safe.
  - Content is created as `draft` regardless of what `status` is passed to the create API (`contentCreateBody`'s
    schema only accepts `status: "draft"`) — the migration script calls `client.publish()` right after each
    `create()`, same as the `emdash content create` CLI command does unless `--draft` is passed.
  - For an `en` translation created via `translationOf`, don't also pass `taxonomies` expecting it to attach
    en-locale term rows: `copyEntryTerms` (run for any `translationOf` create) copies the ko source's
    `content_taxonomies` pivot rows verbatim, and `setTermsForEntry`'s diff (what an explicit `taxonomies` would
    additionally trigger) compares group membership through `taxonomies.translation_group`, not the literal
    stored `taxonomy_id` — a ko-locale term row and its en-locale sibling share one `translation_group`, so
    re-passing the same slugs is a same-group no-op. This is intentional, not a gap: term _reads_
    (`getAllTermsForEntries`, used by `getEmDashCollection`/`getEmDashEntry`) re-join the pivot's `taxonomy_id`
    through `translation_group` filtered by the requesting entry's own locale, so a ko-locale pivot row on an en
    entry still resolves to the en-locale term at read time. Verified against the local DB after migration: all
    32 `content_taxonomies` rows resolve to a same-locale term when re-joined through `translation_group`.
- Content EmDash generates its own public URLs for (sitemap routes, hreflang, admin "view on site" links) resolves
  the default-locale segment via `i18n.routing.prefixDefaultLocale`, which is only meaningful when `routing` is an
  object. This project's `routing: "manual"` (see the i18n gotcha below) makes that check read `undefined`, so
  EmDash would emit ko URLs _without_ the `/ko/` prefix our own `src/pages/[lang]/` routes actually serve at —
  i.e. EmDash's self-generated URLs disagree with reality for the default locale. Our public routes are unaffected
  (they're built directly by `getStaticPaths()`, never through EmDash's URL helpers), so the fix is simply not to
  rely on EmDash's own URL generation (`urlPattern` on collections, its sitemap route, preview links) until this is
  addressed — don't set `urlPattern` expecting it to match `/[lang]/posts/*`.
- Git hooks are managed by lefthook (`lefthook.yml`), installed via the `prepare` script. `pre-commit` runs
  eslint + prettier on staged files in parallel; the **full** vitest suite across 3 browsers runs on `pre-push`,
  so pushes are slow but commits stay fast.
- There is no `src/pages/index.astro` and no `public/_redirects`. `/` → `/ko/` comes solely from
  `astro.config.mjs`'s top-level `redirects` entry. With the Cloudflare adapter installed, this compiles into a
  native `dist/client/_redirects` rule (301) at build time — don't add a separate `public/_redirects` back for
  this route, it would just duplicate the adapter-generated line. Astro's configured `redirects` always lose to a
  real page file at the same path, so don't add an `index.astro` back at the root without removing or updating the
  `redirects` entry.
- `astro.config.mjs`'s `i18n` block must never set `routing.prefixDefaultLocale: true` and must never set
  `fallback`. Pages are generated manually under `src/pages/[lang]/` via `getStaticPaths()`, not Astro's automatic
  locale-folder convention, so neither option is needed for routing to work — but both have real side effects if
  set: `prefixDefaultLocale: true` forces every route, including ones injected by integrations, to carry a locale
  prefix, which 404s an admin UI mounted at a fixed unprefixed path (this blocks EmDash CMS's `/_emdash/admin`, see
  emdash-cms/emdash#369). A `fallback` entry (e.g. `{ en: "ko" }`) makes Astro auto-generate extra build output
  nesting a non-default-locale prefix on top of our own already-prefixed routes (verified: it produced
  `/en/en/posts/*` alongside the real `/en/posts/*`).
- `astro.config.mjs`'s `i18n` block **does** set `routing: "manual"` — this is required, not forbidden, once
  `output` leaves `"static"` (as it does for any non-Vitest run since EmDash needs SSR). With default routing,
  Astro's built-in i18n middleware 404s SSR requests to the default locale's prefixed path (`/ko/*`); this is
  invisible on a fully static build because prerendered pages are served as files and never reach that middleware,
  but reproduces reliably via `astro build && astro preview` (`astro dev` doesn't honor `prerender` at request
  time, so it won't show this). `prefixDefaultLocale: true` can't fix it either — see the gotcha above,
  `/_emdash/admin` 404s. `routing: "manual"` disables Astro's automatic locale handling outright and requires a
  `src/middleware.ts`; here that file is a trivial pass-through (`defineMiddleware((_, next) => next())`) because
  every locale-aware page already resolves `lang` itself via `getStaticPaths` params and never relied on Astro's
  locale detection/redirect logic. Don't remove `routing: "manual"` or `src/middleware.ts` without re-verifying
  `/ko/*` SSR routes via an actual `astro preview`, not just `astro dev`.
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
- `astro build` output is split into `dist/client` (assets) and `dist/server` (worker code) now that
  `@astrojs/cloudflare` is the adapter and `output` is `"server"` (except under Vitest, see above).
  `wrangler.jsonc`'s `assets.directory` points at `dist/client`, not `dist` — see the comment there.
  `wrangler deploy --dry-run` validates the merged config against the real bindings without actually deploying.
  The adapter writes its actual merged Wrangler config to `dist/server/wrangler.json` (pointed to by
  `.wrangler/deploy/config.json`) — read that file, not just `wrangler.jsonc`, to see what a deploy really gets;
  it auto-fills `main` (`entry.mjs`) and a few bindings (e.g. `images.binding`, `kv_namespaces` for sessions) that
  aren't declared in `wrangler.jsonc`. `assets.binding` is the one binding that is **not** auto-filled here: the
  adapter only generates it automatically when there's no custom `wrangler.jsonc` at all, and this project already
  has one (`routes`/`custom_domain`), so it must stay declared explicitly or Worker-served static/prerendered
  output breaks.
- `astro-og` (the `og()` integration in `astro.config.mjs`) is a **dev-toolbar app only** — it doesn't generate
  OG images at build time despite the name. Per-page Open Graph data comes entirely from `BaseLayout`'s
  `title`/`description`/`ogType` props.
- GSAP animations bound outside a `.tsx` island (`Intro.astro`, `Timeline.astro`) run from a plain `<script>` on
  `astro:page-load`, and **must** call `gsap.context(fn, el).revert()` on `astro:before-swap` — without it, a
  `ClientRouter` navigation back to the same page starts another timeline on top of whatever's still running
  instead of replacing it. `Intro.astro`'s coin/text timeline is `repeat: -1`, so skipping `revert()` there
  specifically leaks one more infinite timeline per visit. Additionally, GSAP 3.15 deprecated `yoyoEase` in favour
  of `easeReverse`. When `repeat` is defined inside a `stagger` object, top-level `yoyo` and `yoyoEase` / `easeReverse`
  are no longer inherited by the per-target sub-tweens on 3.15, causing staggered targets to repeat without yoyo and
  remain stuck at their animated offset (e.g. `y: -30`). `repeat`, `yoyo`, and `easeReverse` must all live inside
  the same `stagger` configuration object (`src/lib/intro-animation.ts`, guarded by `tests/lib/intro-animation.test.ts`).
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
