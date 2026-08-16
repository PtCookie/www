import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Tag } from "@/lib/schema.ts";
import { translation, type Translation } from "@/i18n/translation.ts";
import { timelineCopy, timelineEntry, type TimelineItem } from "@/i18n/timeline.ts";
import type { Locale } from "@/config.ts";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getAllTags(posts: { data: { tags: Tag[] } }[], sort = false): (Tag & { count: number })[] {
  const allTags = posts.reduce<(Tag & { count: number })[]>((acc, post) => {
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

export function getTimeline(lang: Locale): TimelineItem[] {
  return timelineEntry.map(({ id, ...entry }) => ({ ...entry, ...timelineCopy[lang][id] }));
}
