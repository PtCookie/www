import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";

export const TagSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const PostSchema = ({ image }: SchemaContext) =>
  z.object({
    publishedAt: z.string(),
    title: z.string(),
    subtitle: z.string(),
    brief: z.string(),
    slug: z.string(),
    readTimeInMinutes: z.number(),
    tags: z.array(TagSchema),
    coverImage: z.object({
      url: image(),
      attribution: z.string().nullable(),
      photographer: z.string().nullable(),
    }),
    locale: z.string(),
  });

export type Tag = z.infer<typeof TagSchema>;
export type Post = z.infer<ReturnType<typeof PostSchema>>;
