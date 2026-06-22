import { describe, it, expect } from "vitest";
import { validateFile, formatFileSize, MAX_IMAGE_SIZE, MAX_FILE_SIZE } from "./files";

function makeFile(name: string, type: string, size: number): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

// ---------------------------------------------------------------------------
// validateFile
// ---------------------------------------------------------------------------

describe("validateFile — images", () => {
  it("accepts PNG", () => {
    expect(validateFile(makeFile("photo.png", "image/png", 1024), "images")).toBeNull();
  });

  it("accepts JPEG", () => {
    expect(validateFile(makeFile("photo.jpg", "image/jpeg", 1024), "images")).toBeNull();
  });

  it("accepts GIF", () => {
    expect(validateFile(makeFile("anim.gif", "image/gif", 1024), "images")).toBeNull();
  });

  it("accepts WebP", () => {
    expect(validateFile(makeFile("img.webp", "image/webp", 1024), "images")).toBeNull();
  });

  it("accepts SVG", () => {
    expect(validateFile(makeFile("icon.svg", "image/svg+xml", 1024), "images")).toBeNull();
  });

  it("rejects a PDF as an image", () => {
    const err = validateFile(makeFile("doc.pdf", "application/pdf", 1024), "images");
    expect(err).toMatch(/file type not allowed/i);
    expect(err).toMatch(/\.png/i);
  });

  it("rejects an unknown MIME type", () => {
    const err = validateFile(makeFile("exec.exe", "application/octet-stream", 1024), "images");
    expect(err).toMatch(/file type not allowed/i);
  });

  it("accepts a file exactly at the 5 MB limit", () => {
    expect(validateFile(makeFile("big.png", "image/png", MAX_IMAGE_SIZE), "images")).toBeNull();
  });

  it("rejects a file 1 byte over the 5 MB limit", () => {
    const err = validateFile(makeFile("toobig.png", "image/png", MAX_IMAGE_SIZE + 1), "images");
    expect(err).toMatch(/file too large/i);
    expect(err).toMatch(/5 MB/);
  });
});

describe("validateFile — files", () => {
  it("accepts PDF", () => {
    expect(validateFile(makeFile("doc.pdf", "application/pdf", 1024), "files")).toBeNull();
  });

  it("accepts plain text", () => {
    expect(validateFile(makeFile("readme.txt", "text/plain", 1024), "files")).toBeNull();
  });

  it("accepts Markdown", () => {
    expect(validateFile(makeFile("notes.md", "text/markdown", 1024), "files")).toBeNull();
  });

  it("accepts JSON", () => {
    expect(validateFile(makeFile("config.json", "application/json", 1024), "files")).toBeNull();
  });

  it("accepts YAML (application/x-yaml)", () => {
    expect(validateFile(makeFile("data.yaml", "application/x-yaml", 1024), "files")).toBeNull();
  });

  it("accepts YAML (text/yaml)", () => {
    expect(validateFile(makeFile("data.yml", "text/yaml", 1024), "files")).toBeNull();
  });

  it("accepts XML (application/xml)", () => {
    expect(validateFile(makeFile("feed.xml", "application/xml", 1024), "files")).toBeNull();
  });

  it("accepts XML (text/xml)", () => {
    expect(validateFile(makeFile("feed.xml", "text/xml", 1024), "files")).toBeNull();
  });

  it("accepts CSV", () => {
    expect(validateFile(makeFile("data.csv", "text/csv", 1024), "files")).toBeNull();
  });

  it("accepts TOML", () => {
    expect(validateFile(makeFile("config.toml", "application/toml", 1024), "files")).toBeNull();
  });

  it("rejects an image MIME type as a file", () => {
    const err = validateFile(makeFile("photo.png", "image/png", 1024), "files");
    expect(err).toMatch(/file type not allowed/i);
    expect(err).toMatch(/\.pdf/i);
  });

  it("rejects an unknown MIME type", () => {
    const err = validateFile(makeFile("binary.bin", "application/octet-stream", 1024), "files");
    expect(err).toMatch(/file type not allowed/i);
  });

  it("accepts a file exactly at the 10 MB limit", () => {
    expect(validateFile(makeFile("big.pdf", "application/pdf", MAX_FILE_SIZE), "files")).toBeNull();
  });

  it("rejects a file 1 byte over the 10 MB limit", () => {
    const err = validateFile(makeFile("toobig.pdf", "application/pdf", MAX_FILE_SIZE + 1), "files");
    expect(err).toMatch(/file too large/i);
    expect(err).toMatch(/10 MB/);
  });
});

// ---------------------------------------------------------------------------
// formatFileSize
// ---------------------------------------------------------------------------

describe("formatFileSize", () => {
  it("formats 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats 1 byte", () => {
    expect(formatFileSize(1)).toBe("1 B");
  });

  it("formats 1023 bytes as B", () => {
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("formats 1024 bytes as 1.0 KB", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
  });

  it("formats 1536 bytes as 1.5 KB", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("formats 1 MB - 1 byte still as KB", () => {
    expect(formatFileSize(1024 * 1024 - 1)).toBe("1024.0 KB");
  });

  it("formats exactly 1 MB", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
  });

  it("formats 5 MB", () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("formats 10 MB", () => {
    expect(formatFileSize(10 * 1024 * 1024)).toBe("10.0 MB");
  });

  it("formats a fractional MB value", () => {
    expect(formatFileSize(Math.round(2.5 * 1024 * 1024))).toBe("2.5 MB");
  });
});
