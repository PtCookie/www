// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import og from "astro-og";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://www.ptcookie.net/",
  // `output` stays at the default "static" — nothing needs on-demand rendering yet. The adapter is
  // added ahead of that need so the Cloudflare Workers build/deploy path is validated independently.
  // Skipped under Vitest: vitest.config.ts pulls this whole config in via `getViteConfig`, and the
  // Cloudflare Vite plugin's worker-environment validation rejects the `resolve.external` Node-builtins
  // list that Vitest's own SSR test environment sets, which crashes `vitest` before any test runs.
  adapter: process.env.VITEST ? undefined : cloudflare(),
  integrations: [react(), mdx(), og()],
  vite: {
    plugins: [tailwindcss()],
  },
  // With the Cloudflare adapter present, this compiles straight into dist/client/_redirects (a native
  // 301) instead of an HTML meta-refresh page — no separate public/_redirects needed.
  redirects: {
    "/": "/ko/",
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: "catppuccin-macchiato",
        dark: "catppuccin-latte",
      },
      wrap: true,
    },
  },
  i18n: {
    locales: ["ko", "en"],
    defaultLocale: "ko",
    // No `fallback`/`routing` block: pages are generated manually under src/pages/[lang]/ via
    // getStaticPaths, not via Astro's automatic locale-folder convention or its content-fallback
    // machinery. With default routing (prefixDefaultLocale: false), a `fallback` entry here makes
    // Astro auto-generate extra pages under a "/en/" prefix layered on top of our own already-prefixed
    // [lang] routes (e.g. /en/en/posts/*), since it treats "en" as a non-default locale needing a
    // rewritten copy of the default locale's content. Keep both unset — routing.prefixDefaultLocale:
    // true also 404s any integration-injected admin UI mounted at a fixed unprefixed path (e.g.
    // EmDash's /_emdash/admin).
  },
});
