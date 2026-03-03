import { createHash, timingSafeEqual } from "node:crypto"
import { findUserByEmail, findUserById } from "./auth.query"

function hashPassword(plainPassword: string) {
  // 시드/로그인 검증에서 공통으로 사용할 SHA-256 해시를 생성한다.
  return createHash("sha256").update(plainPassword).digest("hex")
}

function verifyPassword(plainPassword: string, storedHash: string) {
  // 타이밍 공격 완화를 위해 상수 시간 비교를 수행한다.
  const inputBuffer = Buffer.from(hashPassword(plainPassword), "hex")
  const storedBuffer = Buffer.from(storedHash, "hex")

  if (inputBuffer.length !== storedBuffer.length) {
    return false
  }

  return timingSafeEqual(inputBuffer, storedBuffer)
}

export async function authenticateAdmin(email: string, plainPassword: string) {
  // 이메일 기준으로 관리자 후보 계정을 조회한다.
  const user = await findUserByEmail(email)

  if (!user) {
    return null
  }

  // 입력 비밀번호와 저장된 해시를 비교한다.
  const isPasswordValid = verifyPassword(plainPassword, user.passwordHash)

  if (!isPasswordValid) {
    return null
  }

  return user
}

export async function getLoginCandidate(email: string) {
  // 로그인 대상 계정을 이메일로 조회한다.
  return findUserByEmail(email)
}

export async function getLoginCandidateById(id: string) {
  // 로그인 세션의 사용자 ID로 계정을 조회한다.
  return findUserById(id)
}
