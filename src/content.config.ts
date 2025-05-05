import { defineCollection } from "astro:content";

import { HashnodeLoader } from "@/lib/loader";
import { PostSchema } from "@/lib/schema";

const hostname = import.meta.env.PUBLIC_HASHNODE_BASE_URL;

const post = defineCollection({
  loader: HashnodeLoader({ hostname }),
  schema: PostSchema,
});

export const collections = { post };
