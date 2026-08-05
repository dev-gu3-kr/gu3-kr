import { describe, expect, it } from "vitest"
import { loginSchema } from "./auth.schema"

describe("loginSchema", () => {
  it("accepts a plain administrator username", () => {
    const result = loginSchema.safeParse({
      username: "master",
      password: "password123",
    })

    expect(result.success).toBe(true)
  })

  it("rejects an email address as the administrator username", () => {
    const result = loginSchema.safeParse({
      username: "master@gu3.kr",
      password: "password123",
    })

    expect(result.success).toBe(false)
  })
})
