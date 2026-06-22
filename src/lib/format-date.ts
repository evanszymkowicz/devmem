export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateWithYear(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateLong(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
