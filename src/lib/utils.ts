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

const DATE_LOCALE: Record<Locale, string> = { ko: "ko-KR", en: "en-US" };

// Post frontmatter always carries a +09:00 offset (src/content/post/**), so the timezone is
// pinned to Asia/Seoul rather than the build machine's local time — this is a build-time-only
// render (PostCard/[slug].astro are never hydrated), and pinning keeps the rendered calendar
// date stable and correct regardless of where the static build runs.
export function formatDate(lang: Locale, iso: string): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(iso));
}

export function getTimeline(lang: Locale): TimelineItem[] {
  return timelineEntry.map(({ id, ...entry }) => ({ ...entry, ...timelineCopy[lang][id] }));
}
