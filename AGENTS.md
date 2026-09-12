# www.ptcookie.net

Astro site (https://www.ptcookie.net) on Cloudflare Workers: a static portfolio (Home/Work/About)
plus a blog backed by EmDash, an Astro-native CMS running in-app with an admin UI at
`/_emdash/admin`. React islands + shadcn/ui + Tailwind v4, bilingual (ko/en).

## Commands

```bash
pnpm run dev                          # dev server on :4321
pnpm run build && pnpm run preview    # production build
pnpm run lint                         # eslint
pnpm run format                       # prettier --write .
pnpm run test                         # vitest watch (unit + 3 browsers)
pnpm run test run --project unit      # fast node-only pass
pnpm run test:coverage                # unit + chromium only, with coverage
```

Always spell out `run`/`exec` explicitly — pnpm's bare shorthand (e.g. `pnpm test:coverage`) isn't covered by
`.claude/settings.json`'s `sandbox.excludedCommands: ["pnpm run test*"]`, so it runs sandboxed instead of
unsandboxed and Playwright's browser launch fails with a `mach_port_rendezvous` permission error.

- Component tests need browsers: `pnpm exec playwright install`.

## Architecture

- **Content pipeline**: posts live in EmDash's `posts` collection (Cloudflare D1, media in R2), defined by
  `.emdash/seed.json` and queried at request time via `getEmDashCollection`/`getEmDashEntry` (from `emdash`) —
  wrapped by `src/lib/posts.ts` (`getAllPublishedPosts`, `getPublishedPostBySlug`). `src/lib/post.ts` hand-declares
  `PostData` (the collection's `data` shape — kept in sync with `.emdash/seed.json` by hand, since the generated
  `.emdash/types.ts`/`emdash-env.d.ts` are gitignored), the Portable Text node shapes (see the `emdash/ui` gotcha
  below for why they aren't imported) and `toPostView()`, which flattens a query result into the
  `PostView` shape `PostCard`/`PostList` render (title/subtitle/brief/slug/publishedAt/readTimeInMinutes/tags/
  coverImage). Read time isn't stored — EmDash's content model has no such field — so `getReadTimeInMinutes()`
  estimates it from the Portable Text body. Body content renders via `emdash/ui`'s `<PortableText>`, with the
  `code` block type overridden by `src/components/portable-text/Code.astro` (Shiki syntax highlighting matching
  the site's Catppuccin dual theme — see `src/lib/highlighter.ts`); cover images render via `emdash/ui`'s
  `<Image>`, not `astro:assets`. `src/live.config.ts` (`emdashLoader`) and `src/middleware.ts` wire the runtime in;
  `src/content.config.ts` (file-based collections) no longer exists, along with the markdown corpus and one-time
  migration script that preceded this (see the git history gotcha below).
- **Routing**: portfolio pages (`work.astro`, `about.astro`, `index.astro` is EmDash-backed and SSR, see below) and
  `404.astro` live under `src/pages/[lang]/` (404 at the root); blog routes read `lang`/`slug`/`page`/`tag` straight
  from `Astro.params` at request time and validate with `isLocale()` (`src/config.ts`) instead of using
  `getStaticPaths()`, since EmDash is a live collection. `src/pages/[lang]/posts/[...slug].astro` combines the post
  list and post detail into one rest-param route on purpose — see its own top-of-file comment for why a separate
  `[slug].astro` can't coexist with numbered list pages under SSR. `astro.config.mjs`'s top-level `redirects` sends
  `/` to `/ko/`; `i18n.routing` is deliberately left unset (default `prefixDefaultLocale: false`) — see the gotcha
  below. `work.astro` and `about.astro` sit alongside the blog routes; they (and `index.astro`) pass `wide` to
  `BaseLayout` for a `sm:max-w-5xl` container, matching the header's inner width — every other route (posts, tags, 404) stays at the narrower `sm:max-w-3xl` that keeps article `prose` readable.
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
- `e2e/**/*.spec.ts` → Playwright (`playwright.config.ts`, baseURL `:4321`), run by `pnpm run test:e2e`
  against a `pnpm dev` server Playwright starts itself (that's `playwright.config.ts`'s own `webServer.command`,
  a nested child process — it doesn't need the `run`/`exec` form itself since it inherits the parent's already
  resolved sandbox status). Because that server compiles routes on first request, a
  spec whose assertions ride on a client-side navigation must warm those routes first — `e2e/theme.spec.ts`'s
  `beforeAll` is the pattern, and its own comments carry the trace.

## Documentation

Look up EmDash documentation via the `emdash-docs` MCP server when you need to
verify an API, hook, config option, or pattern. Prefer the docs MCP over
assumptions from training data -- the docs reflect the current published
behaviour.

## Gotchas

Deeper rationale for most of these — incident history, upstream bug traces, and how each failure surfaces —
lives in `.claude/agents/gotcha-guardrail.md`, which reviews a diff against them, and
`.claude/agents/bundle-size-sentinel.md` for anything that grows the Worker. The rules below are the short
form; read those files (or hand the change to the agent) before changing something they cover.

- `vitest.config.ts`'s `coverage.exclude` must never contain a `"!"`-prefixed entry — one negated entry
  zeroes out coverage for _every_ file, silently producing a 0/0 report. Use an extglob instead, e.g.
  `"src/lib/!(utils).ts"`.
- A sandboxed pnpm can resolve the **wrong store**, making every command reinstall — `Recreating
  <project>/node_modules` (it really does delete it), a stray `.pnpm-store/` in `git status`, or
  `ERR_PNPM_UNEXPECTED_STORE`. Fixed by widening `.claude/settings.local.json`'s write allowlist from
  `~/Library/pnpm/store` to `~/Library/pnpm`: pnpm 11's `verifyDepsBeforeRun` compares `.modules.yaml`'s
  `storeDir` against a freshly resolved one on every command and purges `node_modules` on a mismatch, and the
  sandbox broke that resolution by EPERM-ing the `mkdir` probe `@pnpm/store-path` uses to test hardlink support,
  which silently falls back to a store under the project root. Diagnose by comparing `pnpm store path` with
  `.modules.yaml`'s `storeDir` — equal means healthy; override with `--store-dir` or `pnpm-workspace.yaml`'s
  `storeDir` (`.npmrc`'s `store-dir`, `npm_config_store_dir` and `PNPM_HOME` are ignored). pnpm 12 relocates the
  fallback to `<project>/node_modules/.pnpm-store` but keeps the same reinstall behavior.
- `vitest.config.ts` pre-bundles the `astro:transitions` virtual modules in `optimizeDeps`, and the browser project
  is explicitly named `component`. Both comments there explain why — don't strip them, browser tests turn flaky.
- `astro.config.mjs` gates three things on `process.env.VITEST` — `adapter`, `output`, and the `emdash()`
  integration. All three guards must stay and must flip together, or vitest crashes on startup before a single
  test runs.
- `emdash()`'s `database`/`storage` config uses Cloudflare D1/R2 bindings (`d1({binding:"DB"})`,
  `r2({binding:"MEDIA"})`) in **both** dev and prod — never EmDash's suggested `sqlite()`/`local()` dev drivers,
  which need `better-sqlite3` and crash workerd. `wrangler.jsonc`'s `d1_databases[0].database_id` is the real
  provisioned production database (`www-db`), used for both local D1 emulation and the deployed Worker — not a
  placeholder.
- EmDash 0.33.0 has no `emdash.config.ts` / `defineCollection` API — the content model is defined entirely by
  `.emdash/seed.json` (schema: `node_modules/emdash/src/seed/types.ts`), and it is applied **exactly once**, on
  the first request against an empty database. Editing it and redeploying does nothing to an already-bootstrapped
  site: evolving a live schema goes through `/_emdash/admin` or the `emdash schema`/`taxonomy` CLI, then
  `emdash export-seed` back into version control — use the `emdash-schema-change` skill. `.emdash/seed.json` is
  committed; `.emdash/types.ts` and `.emdash/schema.json` are gitignored.
- `.emdash/seed.json`'s taxonomy section must stay a **single** `tag` block whose `terms` carry the en entries
  inline via `locale` + `translationOf`. Re-splitting it per locale recreates a duplicate "Tags" in the admin
  sidebar — an upstream EmDash bug this project already hit and fixed by hand. `tag`/`category` are EmDash
  built-ins seeded by a core migration before `seed.json` runs; `category` sits empty on purpose.
- Never import **types** from `emdash/ui` — it turns CI's `check types` step red, and every local
  `tsc --noEmit` with it. emdash and astro-portabletext ship raw `.ts` that imports `.astro`, which plain `tsc`
  can't resolve (only `astro check` can), and emdash's `src/ui.ts` re-exports the Portable Text types from
  `"astro-portabletext"` — whose entry exports only the component, the types living at `"astro-portabletext/types"`
  and `"@portabletext/types"`, neither reachable from this package. A single type import drags all of that into
  the program: ~60 third-party errors, none fixable here, plus `any` for whatever it imported. `skipLibCheck`
  doesn't help (those are `.ts`, not `.d.ts`). `src/lib/post.ts` hand-declares the Portable Text node shapes for
  exactly this reason; drop them for the real import once emdash fixes the re-export. Value imports
  (`<PortableText>`, `<Image>`) are fine — they only ever happen from `.astro`, which `tsc` doesn't parse.
- Don't rely on EmDash's own URL generation (collection `urlPattern`, its sitemap route, admin preview links):
  under `i18n.routing: "manual"` it emits ko URLs _without_ the `/ko/` prefix our `src/pages/[lang]/` routes
  actually serve at. Our public routes never go through EmDash's URL helpers — keep it that way.
- `astro.config.mjs`'s `r2({...})` sets `publicUrl` (the real `blog-assets.ptcookie.net` domain) only when
  `NODE_ENV !== "development"`. Under `astro dev` it must stay unset so EmDash falls back to its same-origin media
  proxy; with it set, cover images take down the whole page's SSR in dev. `astro preview` and production are
  unaffected.
- `src/lib/dev-island-url.ts`'s `devIslandUrlPlugin()` (in `astro.config.mjs`'s `vite.plugins`, dev-only via
  `apply: "serve"` + a `VITEST` guard) works around an upstream Astro 7 + `@astrojs/cloudflare` bug that breaks
  **all** island hydration under `astro dev`. It depends on `!/src/*` being in `wrangler.jsonc`'s
  `assets.run_worker_first` exclusions, and on sitting at the front of the middleware stack. Don't remove either
  half — the file's own doc comment carries the full trace and the removal condition. `astro preview`/production
  are unaffected.
- Git hooks are managed by lefthook (`lefthook.yml`), installed via the `prepare` script. `pre-commit` runs
  tsc + eslint + prettier on staged files in parallel; the **full** vitest suite across 3 browsers runs on
  `pre-push`, so pushes are slow but commits stay fast.
- There is no `src/pages/index.astro` and no `public/_redirects`. `/` → `/ko/` comes solely from
  `astro.config.mjs`'s top-level `redirects` entry, which the Cloudflare adapter compiles into a native
  `dist/client/_redirects` 301 at build time. Don't duplicate it in `public/_redirects`, and don't add an
  `index.astro` back at the root without updating the `redirects` entry — a real page file always wins.
- `astro.config.mjs`'s `i18n` block must **never** set `routing.prefixDefaultLocale: true` (it 404s
  `/_emdash/admin`, emdash-cms/emdash#369) and must **never** set `fallback` (it generates `/en/en/posts/*`). It
  **must** keep `routing: "manual"` plus the trivial pass-through `src/middleware.ts`, or SSR requests to `/ko/*`
  404 — reproducible only through `astro build && astro preview`, never `astro dev`.
- `src/lib/shiki.ts`'s `shikiThemes` (`light: catppuccin-macchiato`, `dark: catppuccin-latte`) looks swapped but is
  intentional, chosen for code-block readability, not a bug. It's shared between `astro.config.mjs`'s
  `markdown.shikiConfig.themes` and `src/lib/highlighter.ts`'s Portable Text code highlighting — keep both on the
  same constant rather than letting them drift, since the whole point is that they render identically.
- Branches: work on `main`; `production` is a release branch that `main` gets merged into.
- Only `www.ptcookie.net` is registered as a Worker custom domain in `wrangler.jsonc`. The apex `ptcookie.net`
  is a plain proxied CNAME plus a Cloudflare Redirect Rule (`ptcookie.net/*` → `www.ptcookie.net/${1}`, 301) —
  Redirect Rules run before Workers routes at Cloudflare's edge, so apex doesn't need its own Worker route.
- `astro build` output is split into `dist/client` (assets) and `dist/server` (worker code). `wrangler.jsonc`'s
  `assets.directory` points at `dist/client`, not `dist`, and `assets.binding` must stay declared explicitly (the
  adapter only auto-fills it when there's no custom `wrangler.jsonc` at all). The merged config a deploy really
  gets is `dist/server/wrangler.json` — read that, not just `wrangler.jsonc`. `wrangler deploy --dry-run`
  validates it against the real bindings without deploying.
- `wrangler.jsonc`'s `assets.run_worker_first` must stay `true`, not a scoped array: with a scoped list,
  Cloudflare's static-assets layer answers SSR routes with its own 404 before the Worker ever runs. Neither
  `astro dev` nor a successful build shows this — only requesting e.g. `/ko/posts` through `astro preview`.
- `src/pages/404.astro` is **not** prerendered, unlike `work.astro`/`about.astro`: SSR routes reach it via
  `Astro.rewrite("/404")`, and rewriting an on-demand route to a prerendered one fails at runtime. Astro's own
  "no route matched" fallback finds it by filename regardless of prerender status.
- `src/lib/highlighter.ts` imports Shiki's grammars one at a time from `@shikijs/langs/*` instead of using the
  `shiki` package's `createHighlighter`, which would bundle every language and blow the Workers script-size cap
  (CI fails the build above 3072 KiB gzipped). Keep it that way, and measure before adding a language — that's
  what `bundle-size-sentinel` is for. `LANG_ALIAS` maps the corpus's `sh` fences to the grammar's real
  `shellscript` id; `shiki/onig.wasm` is why the top-level `shiki` package stays a dependency.
- `astro-og` (the `og()` integration in `astro.config.mjs`) is a **dev-toolbar app only** — it doesn't generate
  OG images at build time despite the name. Per-page Open Graph data comes entirely from `BaseLayout`'s
  `title`/`description`/`ogType` props.
- GSAP animations bound outside a `.tsx` island (`Intro.astro`, `Timeline.astro`) run from a plain `<script>` on
  `astro:page-load`, and **must** call `gsap.context(fn, el).revert()` on `astro:before-swap` — without it, a
  `ClientRouter` return visit stacks another timeline on the running one, and `Intro.astro`'s is `repeat: -1`.
  On GSAP 3.15, `repeat`, `yoyo`, and `easeReverse` (which replaced `yoyoEase`) must all live inside the same
  `stagger` object, or staggered targets stick at their animated offset (`src/lib/intro-animation.ts`, guarded by
  `tests/lib/intro-animation.test.ts`).
- A Radix `Sheet`/`Dialog` left open during a `ClientRouter` swap can leave `<body>` inert (`overflow: hidden`,
  `pointer-events: none`). `Header.astro`'s `astro:after-swap` listener clears that defensively — don't remove it,
  and wrap any new in-sheet nav link in `<SheetClose asChild>` so Radix's own close path runs first.
- Component tests must not reopen a Base UI menu right after selecting an item: `MenuPositioner` puts an
  inline `pointer-events: none` on the popup for as long as the menu isn't `open`, and a reopen that lands
  inside Base UI's close teardown doesn't always take — user-event then fails the next click with
  "element has `pointer-events: none`". It reproduces only on `component (webkit)` in CI (never locally,
  where Playwright can't launch under the tool sandbox at all), so prefer seeding the starting state on
  `<html>` over driving the menu twice, the way `tests/components/ModeToggle.test.tsx` does.
- Third-party SVGs referenced from `about.astro`'s tech grid live in `public/logos/`, not `src/assets/`, on
  purpose: Astro inlines imported SVGs, and `graphql.svg`'s embedded `<style>` plus `nodejs.svg`'s generic ids
  would leak across the whole page. `src/assets/logo.svg` is fine to inline.
- `astro:assets`' `<Image>` derives height from the EXIF-corrected aspect ratio when only `width` is given, and
  `profile.jpg` is portrait once rotated — the About page passes **both** `width` and `height` plus `object-cover`
  so Sharp crops to the box instead of blowing out the layout.
