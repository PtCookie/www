import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Tag } from "@/lib/schema.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAllTags(posts: Array<{ data: { tags: Array<Tag> } }>, sort = false): Array<Tag & { count: number }> {
  const allTags = posts.reduce<Array<Tag & { count: number }>>((acc, post) => {
    post.data.tags.forEach((tag) => {
      const existingTag = acc.find((t) => t.name === tag.name);

      if (existingTag) {
        existingTag.count++;
      } else {
        acc.push({ ...tag, count: 1 });
      }
    });

    return acc;
  }, []);

  if (!sort) {
    return allTags;
  }

  return allTags.sort((a, b) => (b.count === a.count ? a.name.localeCompare(b.name) : b.count - a.count));
}
