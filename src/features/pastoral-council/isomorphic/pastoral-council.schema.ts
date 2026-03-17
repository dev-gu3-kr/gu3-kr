import { z } from "zod"
import {
  pastoralCouncilDefaultPlaceholderImageType,
  pastoralCouncilPlaceholderImageTypeValues,
  pastoralCouncilRoleValues,
} from "./pastoral-council.types"

export const upsertPastoralCouncilSchema = z.object({
  role: z.enum(pastoralCouncilRoleValues),
  name: z.string().trim().min(1).max(80),
  baptismalName: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  imageUrl: z.string().trim().url().max(500).optional(),
  placeholderImageType: z
    .enum(pastoralCouncilPlaceholderImageTypeValues)
    .default(pastoralCouncilDefaultPlaceholderImageType),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
})

export type UpsertPastoralCouncilSchema = z.infer<
  typeof upsertPastoralCouncilSchema
>
