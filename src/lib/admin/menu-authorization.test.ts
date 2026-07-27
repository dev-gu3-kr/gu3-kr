import { describe, expect, it } from "vitest"
import { canAccessAdminPath } from "./menu-authorization"

describe("canAccessAdminPath", () => {
  it("메뉴 권한 하나로 해당 페이지와 CRUD API를 함께 허용한다", () => {
    expect(canAccessAdminPath("/admin/notices/new", "ADMIN", ["NOTICES"])).toBe(
      true,
    )
    expect(
      canAccessAdminPath("/api/admin/notices/example", "ADMIN", ["NOTICES"]),
    ).toBe(true)
    expect(
      canAccessAdminPath("/api/admin/uploads/notice-image", "ADMIN", [
        "NOTICES",
      ]),
    ).toBe(true)
  })

  it("부여되지 않은 메뉴와 API를 거부한다", () => {
    expect(canAccessAdminPath("/admin/gallery", "ADMIN", ["NOTICES"])).toBe(
      false,
    )
    expect(canAccessAdminPath("/api/admin/gallery", "ADMIN", ["NOTICES"])).toBe(
      false,
    )
  })

  it("공용 업로드 API는 연결된 메뉴 중 하나가 있으면 허용한다", () => {
    expect(
      canAccessAdminPath("/api/admin/uploads/clergy-image", "ADMIN", [
        "PASTORAL_COUNCIL",
      ]),
    ).toBe(true)
    expect(
      canAccessAdminPath("/api/admin/uploads/intro-image", "ADMIN", [
        "YOUTH_ABOUT",
      ]),
    ).toBe(true)
  })

  it("사용자 관리와 미등록 경로는 최고관리자에게만 허용한다", () => {
    expect(canAccessAdminPath("/admin/users", "ADMIN", ["NOTICES"])).toBe(false)
    expect(canAccessAdminPath("/admin/future-menu", "ADMIN", ["NOTICES"])).toBe(
      false,
    )
    expect(canAccessAdminPath("/admin/future-menu", "SUPER_ADMIN", [])).toBe(
      true,
    )
  })
})
