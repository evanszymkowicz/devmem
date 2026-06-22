export const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

export const FILE_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
]);

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const IMAGE_ACCEPT = [...IMAGE_MIME_TYPES].join(",");
export const FILE_ACCEPT = [...FILE_MIME_TYPES].join(",");

export const IMAGE_EXTENSIONS = ".png, .jpg, .gif, .webp, .svg";
export const FILE_EXTENSIONS = ".pdf, .txt, .md, .json, .yaml, .xml, .csv, .toml, .ini";

export const IMAGE_HINT = "PNG, JPG, GIF, WebP, SVG — max 5 MB";
export const FILE_HINT = "PDF, TXT, MD, JSON, YAML, XML, CSV, TOML — max 10 MB";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFile(file: File, typeSlug: "files" | "images"): string | null {
  const isImage = typeSlug === "images";
  const allowed = isImage ? IMAGE_MIME_TYPES : FILE_MIME_TYPES;
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

  if (!allowed.has(file.type)) {
    return `File type not allowed. Accepted: ${isImage ? IMAGE_EXTENSIONS : FILE_EXTENSIONS}`;
  }

  if (file.size > maxSize) {
    return `File too large. Max size: ${isImage ? "5 MB" : "10 MB"}`;
  }

  return null;
}
