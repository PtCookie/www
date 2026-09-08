---
name: gotcha-guardrail
description: Reviews a diff or branch against this project's hard-won invariants — the Astro/Cloudflare/EmDash/Vitest config guards, i18n routing rules, seed/taxonomy rules, and dev-only workarounds whose removal breaks things silently rather than loudly. Use before committing or merging anything that touches astro.config.mjs, wrangler.jsonc, vitest.config.ts, .emdash/seed.json, src/middleware.ts, src/lib/*, or component/animation lifecycle code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You audit changes against this project's documented invariants. Almost every rule below exists
because it already broke once, and most of them fail **silently** — a passing build, a green test
run, or a working `astro dev` does not clear them. Your job is to catch a removal or "cleanup" of
one of these before it ships, not to review general code quality (`/code-review` does that).

## How to run

1. Get the change: `git diff main...HEAD` for a branch, or `git diff HEAD` / `git status` for a
   working tree. If given an explicit target (PR number, path, range), use that instead.
2. For each changed file, look up its section below and check every invariant listed for it.
3. Read the surrounding code before reporting — a rule about `astro.config.mjs` can be violated by
   an edit in `vitest.config.ts`, and several invariants are pairs that must move together.
4. Report only real violations, each with: the file/line, which invariant, what will break, and how
   it will (or won't) surface. If nothing is violated, say so plainly.

Verification commands worth running when a violation is plausible but not certain:

```bash
pnpm exec vitest run --project unit          # fast; proves vitest still boots at all
pnpm build && pnpm exec astro preview        # the only way to see the SSR/i18n/assets-layer bugs
pnpm exec wrangler deploy --dry-run          # validates merged config against real bindings
```

`astro dev` reproduces almost none of the runtime invariants below — never accept it as evidence.

---

## `vitest.config.ts`

- **`coverage.exclude` must never contain a `"!"`-prefixed entry.** `@vitest/coverage-v8` passes
  the whole array straight to picomatch's `ignore` option, where a single negated entry zeroes out
  coverage for _every_ file, not just the one meant to be un-excluded — producing a silent 0/0
  report rather than an error. Use an extglob instead: `"src/lib/!(utils).ts"`.
- **Keep the `astro:transitions` entries in `optimizeDeps` and the browser project's name
  `component`.** Both carry explanatory comments in the file; stripping either makes browser tests
  flaky. Test-file globs (`tests/lib/**` → `unit`, `tests/components/**` → `component`) and the
  script in `package.json` (`--project '*(chromium)'`) depend on that exact project name.

## `astro.config.mjs`

- **The three `process.env.VITEST` guards must stay, and must flip together**: `adapter`
  (`VITEST ? undefined : cloudflare()`), `output` (`VITEST ? "static" : "server"`), and the
  `emdash()` integration. Without the adapter guard, `vitest.config.ts`'s `getViteConfig` drags the
  Cloudflare Vite plugin into every vitest run, and its worker-environment validation rejects the
  Node-builtins `resolve.external` list Vitest's SSR test environment sets — vitest crashes on
  startup and *no tests run at all*. An SSR `output` with no adapter throws
  `AdapterSupportOutputMismatch`, which is why `output` carries the same guard. `emdash()` needs
  server output plus a database connection at config-eval time, neither of which exists under
  Vitest's SSR test environment.
- **`emdash()`'s `database`/`storage` must use Cloudflare bindings in dev too** —
  `d1({binding:"DB"})` and `r2({binding:"MEDIA"})`, never EmDash's suggested local dev drivers
  (`sqlite({url:"file:./data.db"})` + `local()` filesystem storage). `astro dev` here runs the real
  Cloudflare Vite plugin (workerd), which has no Node filesystem and cannot load native N-API
  addons, so `better-sqlite3` crashes dev with `Internal server error: module is not defined` the
  moment EmDash's middleware touches it. D1/R2 are emulated locally by the Vite plugin with no
  native code, so one config works unchanged in both environments.
- **`r2({...})`'s `publicUrl` must remain conditional on `NODE_ENV !== "development"`.** Under
  `astro dev`, cover images render through `emdash/ui`'s `<Image>`, which hands the resolved public
  URL to Astro's `getImage()` (Cloudflare Images binding) — and that binding does a real HTTP fetch
  to transform the image. Local R2 emulation isn't reachable from the public internet, so the fetch
  404s for anything only ever migrated locally and Sharp then crashes parsing the 404 HTML as image
  bytes, taking down the whole page's SSR. With `publicUrl` unset, EmDash's
  `R2Storage.getPublicUrl()` falls back to its own same-origin proxy
  (`/_emdash/api/media/file/<key>`), which reads the R2 binding directly — no network fetch, no
  crash. A cover image's public URL is recomputed from current config on every read (it is not baked
  into the D1 row at upload time), so this config guard alone is sufficient. Astro sets `NODE_ENV`
  per-command, so `astro build`/`preview` and the deployed Worker always get the real
  `blog-assets.ptcookie.net` domain.
  - Separate, local-only, and already fixed — but worth recognising if it resurfaces on an old
    checkout: `wrangler.jsonc`'s R2 `bucket_name` was renamed from `www-emdash-media` to `www-media`
    at some point, after the one-time content migration had already run against the old name, so all
    14 locally migrated media objects sat in a bucket the current config no longer references while
    the configured `www-media` bucket was empty. A fresh clone never hits this. If local cover images
    404 through the proxy route, look for stray populated buckets under
    `.wrangler/state/v3/r2/miniflare-R2BucketObject/*.sqlite`
    (`sqlite3 <file> "select key from _mf_objects"`) and copy objects across with
    `wrangler r2 object get <old-bucket>/<key> --local --file=...` +
    `wrangler r2 object put <new-bucket>/<key> --local --file=...`. Purely local state — no git or
    production impact.
- **The `i18n` block must never set `routing.prefixDefaultLocale: true` and must never set
  `fallback`.** `prefixDefaultLocale: true` forces a locale prefix onto every route including
  integration-injected ones, which 404s EmDash's admin UI at its fixed unprefixed `/_emdash/admin`
  (emdash-cms/emdash#369). A `fallback` entry (e.g. `{ en: "ko" }`) makes Astro generate extra build
  output nesting a locale prefix on top of our already-prefixed routes — verified to produce
  `/en/en/posts/*` alongside the real `/en/posts/*`. Pages are generated manually under
  `src/pages/[lang]/`, so neither option is needed for routing to work.
- **The `i18n` block must keep `routing: "manual"`, and `src/middleware.ts` must keep existing.**
  Once `output` leaves `"static"` (any non-Vitest run, since EmDash needs SSR), Astro's built-in
  i18n middleware 404s SSR requests to the default locale's prefixed path (`/ko/*`). This is
  invisible on a static build (prerendered pages are served as files and never reach the middleware)
  and invisible under `astro dev` (which doesn't honour `prerender` at request time) — it reproduces
  only via `astro build && astro preview`. `prefixDefaultLocale: true` can't fix it either (see
  above). `routing: "manual"` disables Astro's automatic locale handling and *requires* a
  middleware; ours is a deliberate trivial pass-through
  (`defineMiddleware((_, next) => next())`) because every locale-aware page resolves `lang` itself —
  `getStaticPaths` params on `work.astro`/`about.astro`, `Astro.params` + `isLocale()` on the SSR
  routes. Removing either without re-verifying `/ko/*` through a real `astro preview` is a
  violation.
- **Don't add `src/pages/index.astro` or `public/_redirects` for the `/` → `/ko/` redirect.** It
  comes solely from the top-level `redirects` entry, which the Cloudflare adapter compiles into a
  native `dist/client/_redirects` 301 rule at build time; a hand-written `public/_redirects` would
  just duplicate that line. Astro's configured `redirects` always lose to a real page file at the
  same path, so adding an `index.astro` back silently disables the redirect.
- **`devIslandUrlPlugin()` in `vite.plugins` must keep its `apply: "serve"` + `VITEST` guard** and
  must not be removed — see the dev-island section below.
- **`og()` is a dev-toolbar app only.** It does not generate OG images at build time despite the
  name; per-page Open Graph data comes entirely from `BaseLayout`'s `title`/`description`/`ogType`
  props. Flag any change that assumes it emits images.

## `wrangler.jsonc`

- **`assets.run_worker_first` must stay `true`, not a scoped array.** It was `["/_emdash/*"]` before
  the post/tag/locale-index routes became SSR (Phase 4 of the EmDash migration). With a scoped list,
  any path not listed is handled by
  Cloudflare's static-assets layer *before* the Worker runs — and since SSR routes don't exist as
  files under `dist/client`, that layer's own `not_found_handling: "404-page"` returned 404 without
  the Worker (and its D1 query) ever being invoked. Neither `astro dev` (no assets layer in the
  loop) nor a successful build shows this; it appears only by requesting an SSR route such as
  `/ko/posts` through `astro preview` and checking the status code. `dist/server/entry.mjs` falls
  back to `env.ASSETS.fetch()` for prerendered/static paths, so `true` re-orders who checks first
  rather than bypassing CDN-served assets.
- **`assets.run_worker_first`'s exclusion list must keep `!/src/*`.** `@vitejs/plugin-react`'s Fast
  Refresh preamble self-imports each component module under Vite's *root-relative* id (e.g.
  `import * as __vite_react_currentExports from "/src/components/Navigation.tsx"`), separate from
  the `/@fs/...` id used for `import.meta.hot` in the same emitted file. Without the exclusion, the
  Cloudflare plugin's pre-middleware routes that request into the simulated Worker (which 404s
  anything that isn't a real route or `env.ASSETS` file) before Vite's transform middleware sees it.
  Like the other dev-only exclusions there, `/src/*` never exists as a real production request path.
- **`assets.binding` must stay declared explicitly.** The adapter auto-fills it only when there's no
  custom `wrangler.jsonc` at all, and this project has one (`routes`/`custom_domain`) — drop it and
  Worker-served static/prerendered output breaks.
- **`assets.directory` points at `dist/client`, not `dist`**, since `astro build` splits output into
  `dist/client` (assets) and `dist/server` (worker code).
- **`d1_databases[0].database_id` is the real provisioned production `www-db`**, used for both local
  D1 emulation and the deployed Worker. It is not a placeholder to be swapped out.
- When reasoning about what a deploy actually receives, read `dist/server/wrangler.json` (pointed to
  by `.wrangler/deploy/config.json`), not just `wrangler.jsonc` — the adapter merges in `main`
  (`entry.mjs`) and bindings like `images.binding` and the session `kv_namespaces`.
- Only `www.ptcookie.net` is registered as a Worker custom domain. The apex `ptcookie.net` is a
  proxied CNAME plus a Cloudflare Redirect Rule (`ptcookie.net/*` → `www.ptcookie.net/${1}`, 301);
  Redirect Rules run before Workers routes at the edge, so the apex needs no Worker route.

## `.emdash/seed.json` and EmDash schema

- **`seed.json` is applied exactly once**, on the first request against an empty database with setup
  not yet completed. Editing it and redeploying does nothing to an already-bootstrapped site, so a
  diff that changes schema *only* in `seed.json` is incomplete: the live change must also be made
  through `/_emdash/admin` or the `emdash schema`/`taxonomy` CLI (the `emdash-schema-change` skill
  covers the full workflow). EmDash 0.33.0 has no `emdash.config.ts`/`defineCollection` API; the
  integration inlines `seed.json` into a virtual module at build time because workerd has no
  filesystem to read it from at runtime. Resetting local state to re-apply an edited seed means
  deleting `.wrangler/state/v3/{d1,r2}`, which also discards the local passkey and all local content
  — a real decision, not a cache clear.
- **The `tag` taxonomy must stay a single block with per-term `locale`/`translationOf`.** Two
  taxonomy definitions, `category` (hierarchical) and `tag` (flat), are seeded unconditionally by a
  core migration (`node_modules/emdash/src/database/migrations/006_taxonomy_defs.ts`) on every fresh
  install, *before* `seed.json` is applied. Since migration `036_i18n_menus_and_taxonomies.ts` the
  definition unique key is **`(name, locale)`**, so a `seed.json` `tag` block with `locale: "ko"`
  collides with the migration's row and is silently skipped (its custom `label`/`labelSingular`
  never take effect — which is why the file declares the migration's own `"Tags"`/`"Tag"`), while a
  second block for the same taxonomy in *another* locale does **not** collide and instead creates a
  second definition row. That is what produced a duplicate "Tags" in the admin sidebar here:
  `_emdash_taxonomy_defs` held `(tag, ko)` from the migration plus `(tag, en)` from an old
  `tax:tag:en` block, and the admin manifest builder (`emdash-runtime.ts`'s
  `SELECT * FROM _emdash_taxonomy_defs ORDER BY name`) lists every row with no locale filter and no
  `translation_group` dedupe — an upstream EmDash bug (`GET /_emdash/api/taxonomies` supports
  `?locale=`; the manifest just doesn't use it). It was fixed by deleting the `(tag, en)` row from
  local and production D1 and collapsing the file to one block carrying the en terms inline — the
  flat-taxonomy seed path (`seed/apply.ts`) honours per-term `locale`, which is what makes a single
  block sufficient. Any diff that re-splits it per locale recreates the duplicate.
- `category` sits empty in the admin sidebar on purpose — it's an EmDash built-in (the WordPress
  split), `tag` is the semantically correct home for this site's flat blog tags, and 0.33.0 has no
  API/CLI to rename or delete a taxonomy *definition* anyway (only terms have update/delete
  endpoints), so removing it would mean raw SQL. Deleting a definition row is nonetheless safe:
  nothing has a foreign key to `_emdash_taxonomy_defs`, terms join by `name` + `locale`, and
  `content_taxonomies.taxonomy_id` stores a term's `translation_group`. Term CRUD keeps working for
  every locale because handlers call `requireTaxonomyDef(db, name)` without a locale ("terms aren't
  bound to the def's locale"), and the public read path needs only the distinct taxonomy names
  (`loader.ts`'s `getTaxonomyNames`) plus term rows — `getTaxonomyDefs()`'s only consumer is
  `astro/prefetch.ts` cache warming. The fix itself was
  `wrangler d1 execute www-db --local|--remote --command "DELETE FROM _emdash_taxonomy_defs WHERE
  name='tag' AND locale='en';"`, and the 14 terms plus 32 assignment rows were untouched by it.
  Restart `astro dev` after such a change — the defs/names caches are per-isolate module state.
- **Don't rely on EmDash's own URL generation** — collection `urlPattern`, its sitemap route, admin
  "view on site" preview links. EmDash resolves the default-locale segment via
  `i18n.routing.prefixDefaultLocale`, which is only meaningful when `routing` is an object; this
  project's `routing: "manual"` makes that read `undefined`, so EmDash emits ko URLs *without* the
  `/ko/` prefix our `src/pages/[lang]/` routes actually serve at. Our public routes are unaffected
  because they never go through EmDash's URL helpers — the rule is simply not to start.
- The markdown corpus was migrated into D1/R2 by a one-time script (`scripts/migrate-content.mjs` +
  `scripts/lib/markdown-to-portable-text.mjs`), removed once verified. The
  `feat: migrate blog content into EmDash` commit holds the implementation and rationale, including
  why it walked a real markdown AST rather than using EmDash's own line-by-line
  `markdownToPortableText` — relevant only if a similar import is ever written again.
- For an `en` translation created via `translationOf`, passing `taxonomies` is a same-group no-op,
  not a bug: `copyEntryTerms` already copies the ko source's pivot rows, and term reads re-join them
  through `translation_group` filtered by the entry's own locale, so a ko-locale pivot row on an en
  entry still resolves to the en-locale term.

## `src/lib/dev-island-url.ts` (dev-only island hydration workaround)

**Don't remove the plugin, move it out of the front of the middleware stack, or drop its
`apply: "serve"`/`VITEST` guards.** Root cause, for judging whether a change is safe:

Under `astro dev`, every `client:*` island (`Navigation`, `ModeToggle`, `LangToggle`, `Hamburger`)
failed to hydrate because the SSR-rendered `<astro-island component-url="...">` omitted Vite's
`/@fs/` prefix — `component-url` was a bare absolute filesystem path — so the browser's dynamic
import 404'd. This is an upstream Astro 7 bug (confirmed present through astro@7.2.3), not a routing
mistake here: `client:component-path` is compiled to an absolute FS path
(`astro/dist/core/compile/compile.js` via `core/viteUtils.js`'s `resolvePath()`), and
`runtime/server/hydration.js` turns it into `component-url` through a pipeline-supplied `resolve()`.
The correct resolver (`RunnablePipeline` → `createResolve()` → `resolveIdToUrl()`) strips the project
root or prepends `/@fs`, but it's only wired up when Astro's `ssr` Vite environment is a
`RunnableDevEnvironment` — and `@astrojs/cloudflare` replaces that with `@cloudflare/vite-plugin`'s
`CloudflareDevEnvironment`, which doesn't extend it. `isRunnableDevEnvironment()` then fails and
rendering falls back to the non-runnable dev pipeline (`core/app/dev/pipeline.js`, moved to
`core/environment/dev-nonrunnable.js` in 7.2.3), whose `resolve()` is a naive
`specifier.startsWith("/") ? specifier : "/@id/" + specifier` — an absolute FS path starts with `/`,
so it passes through unresolved. `renderer-url` (a bare specifier) is unaffected, which is why only
island hydration breaks.

The plugin does not change what the HTML says (nothing in the SSR render path can, short of patching
Astro). It intercepts the browser's *subsequent* request for that exact URL — the custom element
literally does `import(this.getAttribute("component-url"))` — and rewrites it to `/@fs/...` before
`@cloudflare/vite-plugin`'s pre-middleware can route it into the simulated Worker. That's why it
must sit at the front of `server.middlewares.stack` via `unshift` rather than `use()`: plugin
registration order isn't reliable here, since the Cloudflare plugin manipulates the stack directly
too. The file's doc comment carries the removal condition. `astro preview` and production are
unaffected — they ship real bundled scripts under `/_astro/*`.

## Routing and rendering

- **`src/pages/404.astro` must not be prerendered**, unlike `work.astro`/`about.astro`. Every SSR
  post/tag route reaches a bad slug/page-number/locale via `Astro.rewrite("/404")`, and rewriting an
  on-demand route to a *prerendered* one fails at runtime with `Unexpectedly unable to find a
  component instance for route /404` — the prerendered component was compiled straight to a static
  HTML file at build time and can't be retrieved as a live component instance. Astro's own "no route
  matched" fallback finds the file by its reserved filename regardless of prerender status, so
  on-demand is strictly more capable here.
- `src/pages/[lang]/posts/[...slug].astro` combines the post list and post detail into one
  rest-param route deliberately; its top-of-file comment explains why a separate `[slug].astro`
  can't coexist with numbered list pages under SSR.
- `Navigation` keeps `client:load` because its `Link` dropdown needs a Radix trigger — it was static
  SSR-only markup once, so the directive is load-bearing, not decorative.

## Components, animation, and assets

- **GSAP timelines bound outside a `.tsx` island** (`Intro.astro`, `Timeline.astro`) run from a plain
  `<script>` on `astro:page-load` and **must** call `gsap.context(fn, el).revert()` on
  `astro:before-swap`. Without it, a `ClientRouter` navigation back to the same page starts another
  timeline on top of whatever's still running; `Intro.astro`'s coin/text timeline is `repeat: -1`,
  so each visit leaks one more infinite timeline.
- **On GSAP 3.15, `repeat`, `yoyo`, and `easeReverse` must all live inside the same `stagger`
  object.** 3.15 deprecated `yoyoEase` in favour of `easeReverse`, and when `repeat` is defined
  inside a `stagger`, top-level `yoyo`/`easeReverse` are no longer inherited by the per-target
  sub-tweens — staggered targets then repeat without yoyo and stay stuck at their animated offset
  (e.g. `y: -30`). `tests/lib/intro-animation.test.ts` guards `src/lib/intro-animation.ts`.
- **`Header.astro`'s `astro:after-swap` listener must stay.** A Radix `Sheet`/`Dialog` left open
  during a `ClientRouter` swap can leave `<body>` inert (`overflow: hidden`, `pointer-events: none`)
  when its React cleanup effect doesn't run before the DOM is replaced; the listener clears those
  defensively. New in-sheet nav links must be wrapped in `<SheetClose asChild>` so Radix's own close
  path runs first.
- **Third-party SVGs for `about.astro`'s tech grid belong in `public/logos/`, not `src/assets/`.**
  Astro (≥5.7) inlines `import x from "./x.svg"` as a component, and `graphql.svg` ships an embedded
  `<style>svg{fill:...}</style>` that would restyle every SVG on the page (header icons included),
  while `nodejs.svg` reuses generic `id="a"`-style ids that would collide with anything else inlined
  on the same page. `src/assets/logo.svg` is fine to inline — it's the only SVG on its pages and
  carries no `<style>`.
- **`astro:assets`' `<Image>` needs both `width` and `height` for `profile.jpg`.** With only `width`,
  height is derived from the true EXIF-corrected aspect ratio, and that photo is portrait once
  rotation is applied — width-only sizing produces a very tall image that blows out the layout. The
  About page passes both plus `object-cover` so Sharp crops to the box.
- `src/lib/shiki.ts`'s `shikiThemes` (`light: catppuccin-macchiato`, `dark: catppuccin-latte`) looks
  swapped but is intentional, chosen for code-block readability. It's shared by
  `astro.config.mjs`'s `markdown.shikiConfig.themes` and `src/lib/highlighter.ts` so the two
  rendering paths can't drift — flag any change that "fixes" the naming or forks the constant.
- Adding a Shiki language, a dependency, or anything else that grows the Worker is
  `bundle-size-sentinel`'s territory — hand it off rather than guessing.

## Reporting

Group findings by file, most severe first. For each: the invariant, the exact edit that violates it,
the failure it causes, and where that failure would (and would not) show up. Explicitly note when a
change *looks* like a violation but is fine — e.g. passing `taxonomies` on a `translationOf` entry,
or the deliberately "swapped" Shiki themes.
