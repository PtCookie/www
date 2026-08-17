// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import og from "astro-og";
import emdash from "emdash/astro";
import { d1, r2 } from "@emdash-cms/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://www.ptcookie.net/",
  // With the Cloudflare adapter present, this compiles straight into dist/client/_redirects (a native
  // 301) instead of an HTML meta-refresh page — no separate public/_redirects needed.
  redirects: {
    "/": "/ko/",
  },
  // `output: "server"` is required by EmDash (it serves content at runtime). Skipped under Vitest,
  // same as the adapter below: an SSR output with no adapter throws AdapterSupportOutputMismatch, and
  // vitest.config.ts pulls this whole config in via getViteConfig, so both must flip together.
  output: process.env.VITEST ? "static" : "server",
  // Skipped under Vitest: vitest.config.ts pulls this whole config in via `getViteConfig`, and the
  // Cloudflare Vite plugin's worker-environment validation rejects the `resolve.external` Node-builtins
  // list that Vitest's own SSR test environment sets, which crashes `vitest` before any test runs.
  adapter: process.env.VITEST ? undefined : cloudflare(),
  integrations: [
    react(),
    og(),
    // Same VITEST guard as the adapter/output above — emdash() requires server output and a database
    // connection at config-eval time, neither of which vitest's SSR test environment provides.
    ...(process.env.VITEST
      ? []
      : [
          emdash({
            // D1 + R2 for both dev and prod, not better-sqlite3 + local filesystem storage: this
            // project's `astro dev` runs the actual Cloudflare Vite plugin (workerd), which has no
            // Node filesystem and cannot load native N-API addons. better-sqlite3 (EmDash's suggested
            // local dev driver) crashed dev with "module is not defined" the moment EmDash's own
            // middleware touched it. D1/R2 bindings are emulated locally by the Vite plugin without
            // any native code, so the same config works unchanged in both environments.
            database: d1({ binding: "DB" }),
            storage: r2({ binding: "MEDIA", publicUrl: "https://blog-assets.ptcookie.net" }),
          }),
        ]),
  ],
  vite: {
    plugins: [tailwindcss()],
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
    // Still no `fallback`: pages are generated manually under src/pages/[lang]/ via getStaticPaths,
    // not via Astro's automatic locale-folder convention or its content-fallback machinery. A
    // `fallback` entry here makes Astro auto-generate extra pages under a "/en/" prefix layered on
    // top of our own already-prefixed [lang] routes (e.g. /en/en/posts/*), since it treats "en" as a
    // non-default locale needing a rewritten copy of the default locale's content.
    //
    // `routing: "manual"` (added for EmDash, see src/middleware.ts): with output:"server", Astro's
    // built-in i18n middleware 404s SSR requests to the default locale's prefixed path (/ko/*) —
    // invisible on a fully static build, because prerendered pages are served as files and never
    // reach that middleware. The seemingly obvious fix, `routing.prefixDefaultLocale: true`, is not
    // an option: it forces every route (including integration-injected ones) to require a locale
    // prefix, which 404s EmDash's own unprefixed /_emdash/admin (emdash-cms/emdash#369). "manual"
    // disables Astro's automatic locale handling outright — safe here because every locale-aware
    // page already resolves `lang` itself via getStaticPaths params, so nothing relied on it.
    routing: "manual",
  },
});
