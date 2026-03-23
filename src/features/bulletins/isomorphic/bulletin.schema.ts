import { z } from "zod"

export const createBulletinSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim(),
  isPublished: z.boolean().optional(),
})

export const bulletinPublicListQuerySchema = z.object({
  page: z.coerce.number().int().min(1),
  q: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => value || undefined),
})
