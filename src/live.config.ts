import { defineLiveCollection } from "astro:content";
import { emdashLoader } from "emdash/runtime";

// Live (runtime-fetched) collections, distinct from the build-time collections in
// content.config.ts. `getEmDashCollection`/`getEmDashEntry` route through this loader.
// Coexists with content.config.ts's file-based `post` collection until the EmDash migration
// removes it.
export const collections = {
  _emdash: defineLiveCollection({ loader: emdashLoader() }),
};
