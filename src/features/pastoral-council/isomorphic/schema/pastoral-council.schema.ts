import { z } from "zod"

// 사목협의회 입력값 검증 스키마
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
