import { z } from "zod";

export const CREATABLE_TYPE_SLUGS = [
  "snippets",
  "prompts",
  "commands",
  "notes",
  "links",
  "files",
  "images",
] as const;

export type CreatableTypeSlug = (typeof CREATABLE_TYPE_SLUGS)[number];

export const FILE_TYPE_SLUGS = new Set<CreatableTypeSlug>(["files", "images"]);

export const createItemSchema = z
  .object({
    typeSlug: z.enum(CREATABLE_TYPE_SLUGS),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().nullable().optional(),
    content: z.string().nullable().optional(),
    language: z.string().trim().nullable().optional(),
    url: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z.string().url("Must be a valid URL").nullable().optional(),
    ),
    fileUrl: z.string().min(1).nullable().optional(),
    fileName: z.string().min(1).nullable().optional(),
    fileSize: z.number().positive().int().nullable().optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.typeSlug === "links" && !data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["url"],
        message: "URL is required for links",
      });
    }
    if (FILE_TYPE_SLUGS.has(data.typeSlug)) {
      if (!data.fileUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fileUrl"],
          message: "File must be uploaded first",
        });
      }
      if (!data.fileName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fileName"],
          message: "File name is required",
        });
      }
      if (!data.fileSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fileSize"],
          message: "File size is required",
        });
      }
    }
  });

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  language: z.string().trim().nullable().optional(),
  url: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().url("Must be a valid URL").nullable().optional(),
  ),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
