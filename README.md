# PtCookie.Net

Personal site of PtCookie.Net — portfolio (Home/Work/About) and blog, built with Astro and shadcn/ui.

## Tech stack

### Framework

- [Astro](https://astro.build/)
- [React](https://react.dev/)

#### UI Components

- [shadcn/ui](https://ui.shadcn.com/) - built on [Base UI](https://base-ui.com/) primitives
- [Phosphor Icons](https://phosphoricons.com/) - Icons

### Styling

- [TailwindCSS](https://tailwindcss.com/)
- [Catppuccin](https://catppuccin.com/) - Colorscheme
- [GSAP](https://gsap.com/) - Animation

#### Fonts

- [Inter](https://rsms.me/inter/)
- [Pretendard](https://cactus.tistory.com/306)
- [Newsreader](https://github.com/productiontype/Newsreader)
- [MaruBuri](https://hangeul.naver.com/font/maru)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)

### Testing

- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/) - browser runner for component tests, e2e configured

### Content

Blog posts are managed in [EmDash](https://emdashcms.com/), a CMS built into the Astro app itself
(admin UI at `/_emdash/admin`), backed by Cloudflare D1 (content) and R2 (media). Posts were
originally authored on [Hashnode](https://hashnode.com/), migrated to local markdown, and then
migrated again into EmDash — see AGENTS.md for the content model and query layer.

### Deployment

Deployed to [Cloudflare Workers](https://workers.cloudflare.com/) via
[Wrangler](https://developers.cloudflare.com/workers/wrangler/), using the
[`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) SSR
adapter, with [D1](https://developers.cloudflare.com/d1/) and
[R2](https://developers.cloudflare.com/r2/) bindings for content and media.

## Development

### Prerequisites

```plaintext
node: "^22.12.0 || ^24.11.0"
packageManager: "pnpm@11.17.0"
```

### Development build

```bash
pnpm run dev
```

### Preview production build

```bash
pnpm run build && pnpm run preview
```

### Test

```bash
pnpm run test
```

## License

MIT &copy; [PtCookie](https://www.ptcookie.net/)

All fonts are under [SIL Open Font License v1.1](https://openfontlicense.org/).
