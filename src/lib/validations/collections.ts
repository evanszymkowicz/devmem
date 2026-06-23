import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .nullable()
    .optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

// Same shape as create, but every field optional for partial updates.
export const updateCollectionSchema = createCollectionSchema.partial();

export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
