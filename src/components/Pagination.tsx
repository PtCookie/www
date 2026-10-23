import * as React from "react";

import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination.tsx";
import { range, translate } from "@/lib/utils.ts";
import { config, type Locale } from "@/config.ts";

interface Props {
  total: number;
  currentPage: number;
  basePath: string;
  display?: number;
  prev?: string;
  next?: string;
  lang?: Locale;
}

export function Pagination({
  total,
  currentPage,
  basePath,
  display = 3,
  prev,
  next,
  lang = config.defaultLocale,
}: Props) {
  const minPage = Math.max(1, Math.min(currentPage - Math.floor(display / 2), total - display + 1));
  const maxPage = Math.min(total, Math.max(display, currentPage + Math.floor(display / 2)));
  const pageNumbers = range(minPage, maxPage);

  return (
    <UIPagination label={translate(lang, "component.pagination")}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text={translate(lang, "component.previous")}
            label={translate(lang, "component.previousPage")}
            href={prev}
            aria-disabled={prev ? undefined : true}
            tabIndex={prev ? undefined : -1}
            className={prev ? undefined : "pointer-events-none opacity-50"}
          />
        </PaginationItem>
        {minPage > 1 && (
          <PaginationItem>
            <PaginationEllipsis label={translate(lang, "component.morePages")} />
          </PaginationItem>
        )}
        {pageNumbers.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href={page === 1 ? basePath : `${basePath}/${page}`} isActive={currentPage === page}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {maxPage < total && (
          <PaginationItem>
            <PaginationEllipsis label={translate(lang, "component.morePages")} />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            text={translate(lang, "component.next")}
            label={translate(lang, "component.nextPage")}
            href={next}
            aria-disabled={next ? undefined : true}
            tabIndex={next ? undefined : -1}
            className={next ? undefined : "pointer-events-none opacity-50"}
          />
        </PaginationItem>
      </PaginationContent>
    </UIPagination>
  );
}
