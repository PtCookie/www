import { getEmDashCollection, getEmDashEntry } from "emdash";

import type { Locale } from "@/config.ts";
import type { PostData, PostEntry } from "@/lib/post.ts";

// Passing PostData explicitly (rather than relying on getEmDashCollection's default
// InferCollectionData<T>) sidesteps the ambient EmDashCollections["posts"] declaration that
// `emdash types` would otherwise generate into emdash-env.d.ts — that file is gitignored (see
// AGENTS.md), so source code can't depend on it being present.
const COLLECTION = "posts";

/** All published posts in a locale, newest first, optionally filtered to one tag. Fetches the
 * whole locale (13 entries today) in one call rather than paginating server-side — there's no
 * total-count API to drive Pagination.tsx's page-number UI, and the corpus is small enough that
 * slicing in memory is simpler than juggling cursors/offsets for a numbered archive. */
export async function getAllPublishedPosts(lang: Locale, tagSlug?: string): Promise<PostEntry[]> {
  const { entries, error } = await getEmDashCollection<typeof COLLECTION, PostData>(COLLECTION, {
    status: "published",
    locale: lang,
    orderBy: { published_at: "desc" },
    where: tagSlug ? { tag: tagSlug } : undefined,
  });

  if (error) {
    console.error(`[posts] Failed to load "${lang}" posts:`, error);
    return [];
  }
  return entries;
}

export async function getPublishedPostBySlug(lang: Locale, slug: string): Promise<PostEntry | null> {
  const { entry, error } = await getEmDashEntry<typeof COLLECTION, PostData>(COLLECTION, slug, { locale: lang });

  if (error) {
    console.error(`[posts] Failed to load "${lang}/${slug}":`, error);
  }
  return entry;
}
