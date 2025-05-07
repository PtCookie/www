import { defineCollection } from "astro:content";

import { HashnodeLoader } from "@/lib/loader";
import { PostSchema } from "@/lib/schema";

const post = defineCollection({
  loader: HashnodeLoader(),
  schema: PostSchema,
});

export const collections = { post };
