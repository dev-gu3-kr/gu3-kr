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

// 로그인 비밀번호는 단방향 해시로 저장한다.
function hashPassword(plainPassword: string) {
  return createHash("sha256").update(plainPassword).digest("hex")
}

// 관리자 사용자 목록 조회 서비스다.
export async function getAdminUsers() {
  return findAdminUsers()
}

// 관리자 사용자 단건 조회 서비스다.
export async function getAdminUserById(id: string) {
  return findAdminUserById(id)
}

// 이메일 중복 검사 후 관리자 사용자를 생성한다.
export async function createAdminUserAccount(input: CreateAdminUserInputDto) {
  const normalizedEmail = input.email.trim()
  const existed = await findAdminUserByEmail(normalizedEmail)
  if (existed) throw new Error("이미 사용 중인 이메일입니다.")

  // 레거시 로그인 호환을 위해 username 필드는 email과 동일하게 저장한다.
  return createAdminUser({
    username: normalizedEmail,
    displayName: input.displayName.trim(),
    email: normalizedEmail,
    role: input.role,
    passwordHash: hashPassword(input.password),
    isActive: input.isActive ?? true,
  })
}

// 관리자 사용자 정보(권한/활성/비밀번호)를 갱신한다.
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

// SUPER_ADMIN 삭제는 금지하고 일반 관리자 계정만 삭제한다.
export async function removeAdminUserAccount(id: string) {
  const target = await findAdminUserById(id)
  if (!target) throw new Error("사용자를 찾을 수 없습니다.")
  if (target.role === "SUPER_ADMIN")
    throw new Error("최고관리자 계정은 삭제할 수 없습니다.")
  return deleteAdminUser(id)
}
