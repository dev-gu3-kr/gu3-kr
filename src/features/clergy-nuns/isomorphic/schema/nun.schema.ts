import { z } from "zod"

// 수녀님 프로필 입력값 검증 스키마다.
export const upsertNunSchema = z.object({
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

export type UpsertNunSchema = z.infer<typeof upsertNunSchema>
