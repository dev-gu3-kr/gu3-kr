import { z } from "zod"

export const upsertPastoralCouncilSchema = z.object({
  name: z.string().trim().min(1).max(80),
  baptismalName: z.string().trim().max(80).optional(),
  duty: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(30),
  imageUrl: z.string().trim().url().max(500).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
})

export type UpsertPastoralCouncilSchema = z.infer<
  typeof upsertPastoralCouncilSchema
>
