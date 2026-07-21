import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto"

const SCRYPT_KEY_LENGTH = 64
const SCRYPT_PREFIX = "scrypt"
const LEGACY_SHA256_PATTERN = /^[a-f0-9]{64}$/i

export const DUMMY_PASSWORD_HASH =
  "scrypt$7c99c71956fda02d3a8dd506a7bd3b25$1576b05dc85ab1f8aa64d1ea99dec9d87e814a219eee3239f45bec6a0aa5e7b230787625e3648c66fccb5536890d33ff790c5c80ce7c0050c0a753c9ae0c378c"

function derivePassword(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, SCRYPT_KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }

      resolve(derivedKey)
    })
  })
}

export async function hashPassword(plainPassword: string) {
  const salt = randomBytes(16).toString("hex")
  const derivedKey = await derivePassword(plainPassword, salt)
  return `${SCRYPT_PREFIX}$${salt}$${derivedKey.toString("hex")}`
}

// 기존 SHA-256 계정은 인증을 유지하되 성공 직후 scrypt로 교체하도록 표시한다.
export async function verifyPassword(
  plainPassword: string,
  storedHash: string,
) {
  if (LEGACY_SHA256_PATTERN.test(storedHash)) {
    const inputBuffer = Buffer.from(
      createHash("sha256").update(plainPassword).digest("hex"),
      "hex",
    )
    const storedBuffer = Buffer.from(storedHash, "hex")
    return {
      valid:
        inputBuffer.length === storedBuffer.length &&
        timingSafeEqual(inputBuffer, storedBuffer),
      needsUpgrade: true,
    }
  }

  const [prefix, salt, expectedHex] = storedHash.split("$")
  if (prefix !== SCRYPT_PREFIX || !salt || !expectedHex) {
    return { valid: false, needsUpgrade: false }
  }

  const actualBuffer = await derivePassword(plainPassword, salt)
  const expectedBuffer = Buffer.from(expectedHex, "hex")

  return {
    valid:
      actualBuffer.length === expectedBuffer.length &&
      timingSafeEqual(actualBuffer, expectedBuffer),
    needsUpgrade: false,
  }
}
