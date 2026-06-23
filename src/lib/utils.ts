import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Parses a `?page=` search param into a 1-based page number, clamping anything
// missing, non-numeric, or below 1 to page 1.
export function parsePageParam(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  const page = Number.parseInt(value ?? "", 10)
  return Number.isFinite(page) && page > 1 ? page : 1
}

// Canonical href for a listing page: page 1 omits the query string, every other
// page appends `?page=N`. Shared by the Pagination control and out-of-range
// redirects so both produce identical URLs.
export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`
}
