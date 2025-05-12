// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import markdownIntegration from "@astropub/md";

// https://astro.build/config
export default defineConfig({
  site: "https://devlog.ptcookie.net/",
  integrations: [react(), mdx(), markdownIntegration()],
  vite: {
    plugins: [tailwindcss()],
  },

  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.hashnode.com",
        pathname: "/**",
      },
    ],
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
      fallbackType: "rewrite",
    },
  },
});
