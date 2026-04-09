import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

function buildUrl(baseUrl: string, page: number, searchParams?: Record<string, string>) {
  const params = new URLSearchParams(searchParams);
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const baseStyle =
    "inline-flex h-10 min-w-10 items-center justify-center rounded border text-sm font-medium transition-colors";

  return (
    <nav aria-label="Phân trang" className="mt-8 flex items-center justify-center gap-1.5">
      {currentPage > 1 ? (
        <Link
          href={buildUrl(baseUrl, currentPage - 1, searchParams)}
          className={cn(baseStyle, "border-neutral-200 bg-white hover:bg-neutral-50 px-2")}
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(baseStyle, "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed px-2")}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-neutral-400">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(baseUrl, page, searchParams)}
            className={cn(
              baseStyle,
              page === currentPage
                ? "border-primary bg-primary text-primary-foreground"
                : "border-neutral-200 bg-white hover:bg-neutral-50"
            )}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(baseUrl, currentPage + 1, searchParams)}
          className={cn(baseStyle, "border-neutral-200 bg-white hover:bg-neutral-50 px-2")}
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(baseStyle, "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed px-2")}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
