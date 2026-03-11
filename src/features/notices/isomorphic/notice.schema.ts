import { z } from "zod"

export const createNoticeSchema = z.object({
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().max(300).optional(),
  content: z.string().trim().min(1),
  isPublished: z.boolean().optional(),
  isPinned: z.boolean().optional(),
})
