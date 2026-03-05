import { createHash } from "node:crypto"
import type {
  CreateAdminUserInputDto,
  UpdateAdminUserInputDto,
} from "@/features/users/isomorphic"
import {
  createAdminUser,
  deleteAdminUser,
  findAdminUserByEmail,
  findAdminUserById,
  findAdminUsers,
  updateAdminUser,
} from "./user.query"

function hashPassword(plainPassword: string) {
  return createHash("sha256").update(plainPassword).digest("hex")
}

export async function getAdminUsers() {
  return findAdminUsers()
}

export async function getAdminUserById(id: string) {
  return findAdminUserById(id)
}

export async function createAdminUserAccount(input: CreateAdminUserInputDto) {
  const normalizedEmail = input.email.trim()
  const existed = await findAdminUserByEmail(normalizedEmail)
  if (existed) throw new Error("이미 사용 중인 이메일입니다.")

  return createAdminUser({
    username: normalizedEmail,
    displayName: input.displayName.trim(),
    email: normalizedEmail,
    role: input.role,
    passwordHash: hashPassword(input.password),
    isActive: input.isActive ?? true,
  })
}

export async function updateAdminUserAccount(
  id: string,
  input: UpdateAdminUserInputDto,
) {
  const target = await findAdminUserById(id)
  if (!target) throw new Error("사용자를 찾을 수 없습니다.")

  return updateAdminUser(id, {
    displayName: input.displayName?.trim(),
    email: input.email === null ? null : input.email?.trim(),
    role: input.role,
    isActive: input.isActive,
    ...(input.resetPassword
      ? { passwordHash: hashPassword(input.resetPassword) }
      : {}),
  })
}

export async function removeAdminUserAccount(id: string) {
  const target = await findAdminUserById(id)
  if (!target) throw new Error("사용자를 찾을 수 없습니다.")
  if (target.role === "SUPER_ADMIN")
    throw new Error("최고관리자 계정은 삭제할 수 없습니다.")
  return deleteAdminUser(id)
}
