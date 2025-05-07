import { defineCollection } from "astro:content";

import { HashnodeLoader } from "@/lib/loader.ts";
import { PostSchema } from "@/lib/schema.ts";

const post = defineCollection({
  loader: HashnodeLoader(),
  schema: PostSchema,
});

export const collections = { post };
