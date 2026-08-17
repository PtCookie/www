import { defineMiddleware } from "astro:middleware";

// Required by i18n.routing:"manual" in astro.config.mjs. Every locale-aware route already
// encodes `lang` as an explicit param via getStaticPaths (see src/pages/[lang]/**), so this project
// never relied on Astro's automatic locale detection/redirect/404 behavior — a plain pass-through
// satisfies Astro's "manual routing needs a middleware file" requirement without reintroducing the
// prefixDefaultLocale enforcement that 404s EmDash's unprefixed /_emdash/admin route.
export const onRequest = defineMiddleware((_context, next) => next());
