import { z } from "astro:content";

export const TagSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const PostSchema = z.object({
  id: z.string(),
  author: z.object({
    name: z.string(),
    profilePicture: z.string(),
  }),
  publishedAt: z.string(),
  title: z.string(),
  subtitle: z.string(),
  brief: z.string(),
  slug: z.string(),
  readTimeInMinutes: z.number(),
  content: z.object({
    markdown: z.string(),
  }),
  tags: z.array(TagSchema),
  coverImage: z.object({
    url: z.string(),
    attribution: z.string().nullable(),
    photographer: z.string().nullable(),
  }),
});

export const AllPostsDataSchema = z.object({
  id: z.string(),
  publication: z.object({
    title: z.string(),
    posts: z.object({
      pageInfo: z.object({
        hasNextPage: z.boolean(),
        endCursor: z.string(),
      }),
      edges: z.array(
        z.object({
          node: PostSchema,
        }),
      ),
    }),
  }),
});

export type Tag = z.infer<typeof TagSchema>;
export type Post = z.infer<typeof PostSchema>;
export type AllPostsData = z.infer<typeof AllPostsDataSchema>;
