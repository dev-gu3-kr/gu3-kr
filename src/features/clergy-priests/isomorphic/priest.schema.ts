import { z } from "zod"

export const upsertPriestSchema = z.object({
  name: z.string().trim().min(1).max(80),
  baptismalName: z.string().trim().min(1).max(80),
  duty: z.string().trim().min(1).max(120),
  feastMonth: z.number().int().min(1).max(12),
  feastDay: z.number().int().min(1).max(31),
  termStart: z.string().datetime(),
  termEnd: z.string().datetime().optional(),
  phone: z.string().trim().max(30).optional(),
  imageUrl: z.string().trim().url().max(500).optional(),
  isCurrent: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
})

export type UpsertPriestSchema = z.infer<typeof upsertPriestSchema>
