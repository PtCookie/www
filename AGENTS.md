# devlog

Static Astro blog (https://devlog.ptcookie.net) that pulls posts from Hashnode at build time.
React islands + shadcn/ui + Tailwind v4, bilingual (ko/en).

## Commands

```bash
pnpm dev                              # dev server on :4321
pnpm build && pnpm preview            # production build (fetches Hashnode over the network)
pnpm lint                             # eslint
pnpm format                           # prettier --write .
pnpm test                             # vitest watch (unit + 3 browsers)
pnpm exec vitest run --project unit   # fast node-only pass
pnpm test:coverage                    # unit + chromium only, with coverage
pnpm codegen                          # regenerate generated/schema.graphql from the Hashnode API
```

- `pnpm build` needs `.env` with `PUBLIC_HASHNODE_BASE_URL` and network access — there is no local content fallback.
- Component tests need browsers: `pnpm exec playwright install`.

## Architecture

- **Content pipeline**: Hashnode GraphQL → `src/lib/client.ts` (single `allPosts` query) → `src/lib/loader.ts`
  (custom Astro `Loader`) → `post` collection in `src/content.config.ts`, validated by `src/lib/schema.ts`.
  The loader queries once per locale and stores one entry per post per locale; the `locale` field is the discriminator,
  so every `getCollection("post")` call must filter on it.
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

- `vitest.config.ts` pre-bundles the `astro:transitions` virtual modules in `optimizeDeps`, and the browser project
  is explicitly named `component`. Both comments there explain why — don't strip them, browser tests turn flaky.
- The pre-commit hook runs the **full** vitest suite across 3 browsers plus lint-staged, so commits are slow.
- `src/pages/index.astro` is intentionally empty; Astro's i18n config generates the `/` → `/ko/` redirect
  (`public/_redirects` covers the host side).
- `generated/schema.graphql` is produced by `pnpm codegen` — never edit it by hand.
- In `astro.config.mjs`'s `markdown.shikiConfig.themes`, `light` is set to `catppuccin-macchiato` and `dark` to
  `catppuccin-latte` — this looks swapped but is intentional, chosen for code-block readability, not a bug.
- `wrangler.toml` still points `main` at `@astrojs/cloudflare`, which is not installed; the build is fully static today.
- Branches: work on `main`; `production` is a release branch that `main` gets merged into.
