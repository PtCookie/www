// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import og from "astro-og";
import emdash from "emdash/astro";
import { d1, r2 } from "@emdash-cms/cloudflare";

import { shikiThemes } from "./src/lib/shiki.ts";

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
            storage: r2({
              binding: "MEDIA",
              // Local R2 emulation (astro dev) isn't reachable from the public internet, so when
              // EmDashImage.astro hands a cover image's public URL to Astro's getImage() (Cloudflare
              // Images binding), the binding's real HTTP fetch against blog-assets.ptcookie.net 404s
              // for anything only ever migrated locally — Sharp then crashes trying to parse the 404
              // HTML as image bytes, and the whole page's SSR fails. Omitting publicUrl makes EmDash's
              // R2Storage.getPublicUrl() fall back to its own same-origin proxy
              // (/_emdash/api/media/file/<key>, node_modules/@emdash-cms/cloudflare/src/storage/r2.ts),
              // which reads through the R2 *binding* directly — no network fetch, so no crash. cover
              // images aren't baked with an absolute src at upload time (confirmed against the actual
              // local D1 rows), so this is a config-only fix; no data migration needed.
              //
              // `astro build` always evaluates this config with NODE_ENV=production (Astro sets it
              // per-command), so `astro preview` and the real deployed Worker always get the real
              // public URL unchanged — this only affects `astro dev`.
              publicUrl: process.env.NODE_ENV === "development" ? undefined : "https://blog-assets.ptcookie.net",
            }),
          }),
        ]),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      // See src/lib/shiki.ts — shared with the Portable Text code block component so both
      // pipelines produce identical highlighting output.
      themes: shikiThemes,
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
