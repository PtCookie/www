// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import og from "astro-og";

// https://astro.build/config
export default defineConfig({
  site: "https://www.ptcookie.net/",
  integrations: [react(), mdx(), og()],
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
    fallback: {
      en: "ko",
    },
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
      fallbackType: "rewrite",
    },
  },
});
