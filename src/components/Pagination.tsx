import React from "react";

import { range } from "@/lib/utils.ts";
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination.tsx";

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
          <PaginationPrevious href={prev} className={prev ? undefined : "opacity-50"} />
        </PaginationItem>
        {minPage > 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {pageNumbers.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href={`${basePath}/${page}`} isActive={currentPage === page}>
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
          <PaginationNext href={next} className={next ? undefined : "opacity-50"} />
        </PaginationItem>
      </PaginationContent>
    </UIPagination>
  );
}
