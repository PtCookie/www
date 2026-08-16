import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import { PostSchema } from "@/lib/schema.ts";

const post = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/post",
    // The default id generator uses frontmatter `slug` when present, which collides across locales
    // (ko/en share the same slug per post). Derive the id from the file path instead, so each
    // locale's copy of a post gets its own entry.
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: PostSchema,
});

export const collections = { post };
