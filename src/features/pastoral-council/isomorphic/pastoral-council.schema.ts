import { z } from "zod"
import {
  pastoralCouncilChildrenLayoutValues,
  pastoralCouncilDefaultPlaceholderImageType,
  pastoralCouncilPlaceholderImageTypeValues,
} from "./pastoral-council.types"

export const upsertPastoralCouncilPositionSchema = z.object({
  title: z.string().trim().min(1).max(80),
  parentId: z.string().trim().min(1).nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  childrenLayout: z.enum(pastoralCouncilChildrenLayoutValues).default("AUTO"),
  childrenColumns: z.number().int().min(1).max(4).default(2),
  isActive: z.boolean().optional(),
  defaultPlaceholderImageType: z
    .enum(pastoralCouncilPlaceholderImageTypeValues)
    .default(pastoralCouncilDefaultPlaceholderImageType),
})

export const upsertPastoralCouncilSchema = z.object({
  positionId: z.string().trim().min(1),
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

export type UpsertPastoralCouncilPositionSchema = z.infer<
  typeof upsertPastoralCouncilPositionSchema
>
