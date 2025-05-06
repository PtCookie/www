// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import markdownIntegration from "@astropub/md";

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/posts/1": "/posts",
  },
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
      theme: "catppuccin-macchiato",
      wrap: true,
    },
  },
});
