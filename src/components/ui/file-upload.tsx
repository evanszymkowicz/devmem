"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { File as FileIcon, Image as ImageIcon, Upload, X } from "lucide-react";

import { validateFile, formatFileSize, IMAGE_ACCEPT, FILE_ACCEPT, IMAGE_HINT, FILE_HINT } from "@/lib/files";

export interface UploadedFile {
  key: string;
  fileName: string;
  fileSize: number;
}

interface FileUploadProps {
  typeSlug: "files" | "images";
  onUploadComplete: (data: UploadedFile) => void;
}

type UploadStatus =
  | { type: "idle" }
  | { type: "uploading"; progress: number; fileName: string }
  | { type: "done"; data: UploadedFile; previewUrl?: string }
  | { type: "error"; message: string };

export function FileUpload({ typeSlug, onUploadComplete }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>({ type: "idle" });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file, typeSlug);
      if (error) {
        setStatus({ type: "error", message: error });
        return;
      }

      // Revoke previous preview
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }

      // Create local preview for images before uploading
      let previewUrl: string | undefined;
      if (typeSlug === "images") {
        previewUrl = URL.createObjectURL(file);
        previewRef.current = previewUrl;
      }

      setStatus({ type: "uploading", progress: 0, fileName: file.name });

      try {
        // Step 1: get a pre-signed PUT URL from our API
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            typeSlug,
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(err.error ?? "Failed to get upload URL");
        }

        const { uploadUrl, key } = await res.json() as { uploadUrl: string; key: string };

        // Step 2: PUT the file directly to R2 using the signed URL
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setStatus({
                type: "uploading",
                progress: Math.round((e.loaded / e.total) * 100),
                fileName: file.name,
              });
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        const uploaded = { key, fileName: file.name, fileSize: file.size };
        setStatus({ type: "done", data: uploaded, previewUrl });
        onUploadComplete(uploaded);
      } catch (e) {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          previewRef.current = null;
        }
        setStatus({
          type: "error",
          message: e instanceof Error ? e.message : "Upload failed",
        });
      }
    },
    [typeSlug, onUploadComplete],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  function reset() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setStatus({ type: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  const isImage = typeSlug === "images";
  const accept = isImage ? IMAGE_ACCEPT : FILE_ACCEPT;

  if (status.type === "done") {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        {isImage && status.previewUrl && (
          <div className="mb-3 flex justify-center">
            <img
              src={status.previewUrl}
              alt={status.data.fileName}
              className="max-h-40 max-w-full rounded-md object-contain"
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
            {isImage ? (
              <ImageIcon className="size-4 text-muted-foreground" />
            ) : (
              <FileIcon className="size-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{status.data.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(status.data.fileSize)}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  if (status.type === "uploading") {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="truncate text-muted-foreground">{status.fileName}</span>
          <span className="ml-2 shrink-0 tabular-nums text-muted-foreground">
            {status.progress}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-150"
            style={{ width: `${status.progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          "flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30",
        ].join(" ")}
      >
        <Upload className="size-6 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            Drop {isImage ? "image" : "file"} here or click to browse
          </p>
          {status.type === "error" ? (
            <p className="mt-1 text-xs text-destructive">{status.message}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              {isImage ? IMAGE_HINT : FILE_HINT}
            </p>
          )}
        </div>
      </button>
    </>
  );
}
