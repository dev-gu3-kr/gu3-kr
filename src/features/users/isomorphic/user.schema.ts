import { z } from "zod"

export const createAdminUserSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
  password: z.string().min(8).max(120),
  isActive: z.boolean().optional(),
})

export const updateAdminUserSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email().max(120).nullable().optional(),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]).optional(),
  isActive: z.boolean().optional(),
  resetPassword: z.string().min(8).max(120).optional(),
})
