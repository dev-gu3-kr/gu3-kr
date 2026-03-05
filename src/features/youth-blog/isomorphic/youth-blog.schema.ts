import { z } from "zod"

export const createYouthBlogSchema = z.object({
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().max(300).optional(),
  content: z.string().trim().min(1),
  isPublished: z.boolean().optional(),
})
