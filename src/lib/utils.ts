import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Tag } from "@/lib/post.ts";
import { translation, type Translation } from "@/i18n/translation.ts";
import { formatPeriod, timelineCopy, timelineEntry, type TimelineItem } from "@/i18n/timeline.ts";
import type { Locale } from "@/config.ts";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Extra classes every tag chip carries on top of `badgeVariants({ variant: "secondary" })`.
// The `h-6` overrides the variant's `h-5` (20px) base so the chip clears the 24x24 CSS px
// minimum touch target. Shared so TagList.astro and PostCard.tsx can't drift — PostCard is a
// React file and can't import the .astro component itself.
export const tagLinkClass = "font-mono h-6";

export function getAllTags(posts: { data: { tags: Tag[] } }[], sort = false): (Tag & { count: number })[] {
  const allTags = posts.reduce<(Tag & { count: number })[]>((acc, post) => {
    post.data.tags.forEach((tag) => {
      // Dedup by slug, not name: slug is the taxonomy term's stable identity (labels can be
      // renamed in the admin without changing the slug), and it's what tag routes key off of.
      const existingTag = acc.find((t) => t.slug === tag.slug);

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

const PLURAL_LOCALE: Record<Locale, string> = { ko: "ko-KR", en: "en-US" };

// Intl.PluralRules("ko-KR") always resolves to "other", so this is a no-op for Korean
// (page.post and page.posts are the same word) and only affects English "1 post" vs "N posts".
export function getPostCountLabel(lang: Locale, count: number): string {
  const category = new Intl.PluralRules(PLURAL_LOCALE[lang]).select(count);
  return translate(lang, category === "one" ? "page.post" : "page.posts");
}

const DATE_LOCALE: Record<Locale, string> = { ko: "ko-KR", en: "en-US" };

// Post publishedAt values are stored with a +09:00 offset, so the timezone is pinned to
// Asia/Seoul rather than the request-handling Worker's own timezone — this is a server-rendered,
// non-hydrated render (PostCard/posts/[...slug].astro are never client components), and pinning
// keeps the rendered calendar date stable and correct regardless of which Cloudflare colo serves
// the request.
export function formatDate(lang: Locale, iso: string): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(iso));
}

export function getTimeline(lang: Locale): TimelineItem[] {
  return timelineEntry.map(({ id, periodStart, periodEnd, ...entry }) => ({
    ...entry,
    period: formatPeriod(periodStart, periodEnd),
    ...timelineCopy[lang][id],
  }));
}
