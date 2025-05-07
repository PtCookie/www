import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Tag } from "@/lib/schema.ts";
import { translation, type Translation } from "@/i18n/translation.ts";
import type { Locale } from "@/config.ts";

export function cn(...inputs: ClassValue[]): string {
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

export function range(stop: number): number[];
export function range(start: number, stop: number): number[];
export function range(start: number, stop: number, step: number): number[];
export function range(start: number, stop?: number, step = 1): number[] {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }

  return Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);
}

export function translate(lang: Locale, key: keyof Translation): string {
  return translation[lang][key];
}
