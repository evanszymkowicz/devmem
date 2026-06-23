import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn, pageHref } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  // Path the page links point at, e.g. "/items/snippets". Page 1 omits the
  // query string; every other page appends `?page=N`.
  basePath: string;
}

const baseLinkClass =
  "flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors";

// Builds the windowed page list: always the first and last page, the current
// page with one neighbour on each side, and "ellipsis" markers for the gaps.
// Only called when totalPages >= 2.
function getPageWindow(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  const NEIGHBORS = 1;
  const left = Math.max(2, currentPage - NEIGHBORS);
  const right = Math.min(totalPages - 1, currentPage + NEIGHBORS);

  const window: (number | "ellipsis")[] = [1];
  if (left > 2) window.push("ellipsis");
  for (let page = left; page <= right; page++) window.push(page);
  if (right < totalPages - 1) window.push("ellipsis");
  window.push(totalPages);
  return window;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  // Nothing to page through — render nothing rather than a lone disabled control.
  if (totalPages <= 1) return null;

  // null means "no page in that direction"; the control renders disabled.
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const hrefFor = (page: number) => pageHref(basePath, page);
  const window = getPageWindow(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-1"
    >
      {prevPage === null ? (
        <span
          aria-disabled="true"
          className={cn(
            baseLinkClass,
            "pointer-events-none text-muted-foreground/40",
          )}
        >
          <ChevronLeft className="size-4" />
        </span>
      ) : (
        <Link
          href={hrefFor(prevPage)}
          aria-label="Previous page"
          className={cn(baseLinkClass, "text-foreground hover:bg-muted")}
        >
          <ChevronLeft className="size-4" />
        </Link>
      )}

      {window.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className={cn(baseLinkClass, "text-muted-foreground")}
          >
            <MoreHorizontal className="size-4" />
          </span>
        ) : page === currentPage ? (
          <span
            key={page}
            aria-current="page"
            className={cn(baseLinkClass, "bg-foreground text-background")}
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={hrefFor(page)}
            className={cn(baseLinkClass, "text-foreground hover:bg-muted")}
          >
            {page}
          </Link>
        ),
      )}

      {nextPage === null ? (
        <span
          aria-disabled="true"
          className={cn(
            baseLinkClass,
            "pointer-events-none text-muted-foreground/40",
          )}
        >
          <ChevronRight className="size-4" />
        </span>
      ) : (
        <Link
          href={hrefFor(nextPage)}
          aria-label="Next page"
          className={cn(baseLinkClass, "text-foreground hover:bg-muted")}
        >
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
