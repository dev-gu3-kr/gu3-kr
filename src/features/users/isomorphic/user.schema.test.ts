import { describe, expect, it } from "vitest"
import { createAdminUserSchema } from "./user.schema"

describe("createAdminUserSchema", () => {
  const validInput = {
    displayName: "관리자",
    username: "parish_admin",
    password: "password123",
    menuPermissions: ["NOTICES"],
  }

  it("accepts a plain administrator username", () => {
    expect(createAdminUserSchema.safeParse(validInput).success).toBe(true)
  })

  it("rejects an email address as the administrator username", () => {
    const result = createAdminUserSchema.safeParse({
      ...validInput,
      username: "admin@gu3.kr",
    })

    expect(result.success).toBe(false)
  })
})
