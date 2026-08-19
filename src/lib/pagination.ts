export interface PagedItems<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  prevUrl?: string;
  nextUrl?: string;
}

/** Slice `all` into a numbered page, mirroring Astro's own `paginate()` URL convention: page 1
 * lives at `basePath` with no page-number suffix, later pages at `${basePath}/${page}`. Returns
 * null for an out-of-range page (caller should 404). */
export function paginate<T>(all: T[], page: number, pageSize: number, basePath: string): PagedItems<T> | null {
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return null;

  const start = (page - 1) * pageSize;
  return {
    items: all.slice(start, start + pageSize),
    currentPage: page,
    totalPages,
    prevUrl: page > 1 ? (page - 1 === 1 ? basePath : `${basePath}/${page - 1}`) : undefined,
    nextUrl: page < totalPages ? `${basePath}/${page + 1}` : undefined,
  };
}
