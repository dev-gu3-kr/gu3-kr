import type {
  CreateAdminUserInputDto,
  UpdateAdminUserInputDto,
} from "@/features/users/isomorphic"
import { hashPassword } from "@/lib/auth/password"
import {
  createAdminUser,
  deleteAdminUser,
  findAdminUserById,
  findAdminUserByUsername,
  findAdminUsers,
  updateAdminUser,
} from "./user.query"

// 관리자 사용자 목록 조회 서비스다.
export async function getAdminUsers() {
  return findAdminUsers()
}

// 관리자 사용자 단건 조회 서비스다.
export async function getAdminUserById(id: string) {
  return findAdminUserById(id)
}

// 대소문자를 구분하지 않는 아이디 중복 검사 후 관리자 계정을 생성한다.
export async function createAdminUserAccount(input: CreateAdminUserInputDto) {
  const normalizedUsername = input.username.trim().toLowerCase()
  const existed = await findAdminUserByUsername(normalizedUsername)
  if (existed) throw new Error("이미 사용 중인 아이디입니다.")

  return createAdminUser({
    username: normalizedUsername,
    displayName: input.displayName.trim(),
    role: "ADMIN",
    menuPermissions: input.menuPermissions,
    passwordHash: await hashPassword(input.password),
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

  const normalizedUsername = input.username?.trim().toLowerCase()
  if (normalizedUsername && normalizedUsername !== target.username) {
    const existed = await findAdminUserByUsername(normalizedUsername)
    if (existed) throw new Error("이미 사용 중인 아이디입니다.")
  }

  return updateAdminUser(id, {
    displayName: input.displayName?.trim(),
    username: normalizedUsername,
    menuPermissions: input.menuPermissions,
    isActive: input.isActive,
    ...(input.resetPassword
      ? { passwordHash: await hashPassword(input.resetPassword) }
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
