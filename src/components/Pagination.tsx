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
import { range } from "@/lib/utils.ts";

interface Props {
  total: number;
  currentPage: number;
  basePath: string;
  display?: number;
  prev?: string;
  next?: string;
}

export function Pagination({ total, currentPage, basePath, display = 3, prev, next }: Props) {
  const minPage = Math.max(1, Math.min(currentPage - Math.floor(display / 2), total - display + 1));
  const maxPage = Math.min(total, Math.max(display, currentPage + Math.floor(display / 2)));
  const pageNumbers = range(minPage, maxPage);

  return (
    <UIPagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={prev}
            aria-disabled={prev ? undefined : true}
            tabIndex={prev ? undefined : -1}
            className={prev ? undefined : "pointer-events-none opacity-50"}
          />
        </PaginationItem>
        {minPage > 1 && (
          <PaginationItem>
            <PaginationEllipsis />
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
            <PaginationEllipsis />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
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
