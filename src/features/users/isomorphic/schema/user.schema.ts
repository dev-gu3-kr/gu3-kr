import { UserRole } from "@prisma/client"
import { z } from "zod"

export const createAdminUserSchema = z.object({
  username: z.string().trim().min(3).max(30),
  displayName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120).optional(),
  role: z.nativeEnum(UserRole),
  password: z.string().min(8).max(120),
  isActive: z.boolean().optional(),
})

export const updateAdminUserSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email().max(120).nullable().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  resetPassword: z.string().min(8).max(120).optional(),
})
