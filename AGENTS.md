# www.ptcookie.net

Static Astro blog (https://www.ptcookie.net), content authored as local markdown.
React islands + shadcn/ui + Tailwind v4, bilingual (ko/en).

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
  (`src/config.ts`). `astro.config.mjs` sets `prefixDefaultLocale: true`, so `/` redirects to `/ko/`.
- **UI**: `.astro` for static markup, `.tsx` React islands only where interaction is needed
  (`ModeToggle`, `LangToggle`, `Navigation`, `Pagination`, `PostCard`). `src/components/ui/*` is shadcn-generated
  (new-york style) — add components with the shadcn CLI instead of hand-writing them.
- **Theming**: Catppuccin Latte (light) / Macchiato (dark) tokens in `src/styles/global.css` `@theme`;
  `ModeToggle` toggles the `dark` class on `<html>`.

## Conventions

- Imports use the `@/` alias **with the file extension**: `@/lib/utils.ts`, `@/components/ui/button.tsx`.
- Every user-facing string goes into the `Translation` interface in `src/i18n/translation.ts` (both `ko` and `en`)
  and is read through `translate(lang, key)`.
- Reuse `src/lib/utils.ts`: `cn`, `getAllTags`, `range`, `translate`.
- Code comments in English. Prettier + `.editorconfig` decide formatting (120 cols; 2 spaces, 4 in css/json).
- Conventional Commits (`feat:`, `fix:`, `test:`, `chore(deps):`).

## Testing

- `tests/lib/**/*.test.ts` → vitest `unit` project, node environment.
- `tests/components/**/*.test.tsx` → `component` project, real chromium/firefox/webkit via `@vitest/browser-playwright`,
  Testing Library + jest-dom, setup in `tests/setup.ts`.
- Coverage tracks `src/**` minus `.astro` files and `src/lib/*` except `utils.ts`.
- Playwright e2e is configured (`playwright.config.ts`, `testDir: ./e2e`, baseURL `:4321`) but no specs exist yet.

## Gotchas

- `vitest.config.ts`'s `coverage.exclude` must never contain a `"!"`-prefixed entry: `@vitest/coverage-v8`
  passes the whole array straight to picomatch's `ignore` option, and one negated entry zeroes out coverage
  for _every_ file (not just the one you meant to un-exclude), silently producing a 0/0 report. Use an
  extglob instead, e.g. `"src/lib/!(utils).ts"` to exclude everything in `src/lib` except `utils.ts`.
- Vitest's browser project (and anything that runs it — `pnpm test:coverage`, the pre-push hook) needs to
  bind a local port for Playwright's browser instances. In network-sandboxed tool runners this fails with
  `EPERM: operation not permitted ::1:<port>` — disable the sandbox for that command rather than debugging it
  as a code issue.
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
