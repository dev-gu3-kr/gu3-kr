import { z } from "zod"
import { ADMIN_MENU_PERMISSION_VALUES } from "@/features/admin/isomorphic"
import { adminUsernameSchema } from "@/features/auth/isomorphic"

const menuPermissionsSchema = z
  .array(z.enum(ADMIN_MENU_PERMISSION_VALUES))
  .min(1, "메뉴 권한을 하나 이상 선택해 주세요.")

export const createAdminUserSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "표시 이름을 입력해 주세요.")
    .max(80, "표시 이름은 80자 이하로 입력해 주세요."),
  username: adminUsernameSchema,
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상 입력해 주세요.")
    .max(120, "비밀번호는 120자 이하로 입력해 주세요."),
  menuPermissions: menuPermissionsSchema,
  isActive: z.boolean().optional(),
})

export const updateAdminUserSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  username: adminUsernameSchema.optional(),
  isActive: z.boolean().optional(),
  resetPassword: z.string().min(8).max(120).optional(),
  menuPermissions: menuPermissionsSchema.optional(),
})

export const updateAdminUserMenuPermissionsSchema = z.object({
  menuPermissions: menuPermissionsSchema,
})
