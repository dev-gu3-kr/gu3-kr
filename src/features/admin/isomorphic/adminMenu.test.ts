import { describe, expect, it } from "vitest"
import { ADMIN_MENU_ITEMS, getAccessibleAdminMenuItems } from "./adminMenu"

describe("getAccessibleAdminMenuItems", () => {
  it("일반 관리자에게 부여된 메뉴만 반환한다", () => {
    const items = getAccessibleAdminMenuItems("ADMIN", ["NOTICES", "EVENTS"])

    expect(items.map((item) => item.permission)).toEqual(["NOTICES", "EVENTS"])
  })

  it("최고관리자에게 사용자 등록을 포함한 전체 메뉴를 반환한다", () => {
    const items = getAccessibleAdminMenuItems("SUPER_ADMIN", [])

    expect(items).toEqual(ADMIN_MENU_ITEMS)
    expect(items.some((item) => item.href === "/admin/users")).toBe(true)
  })
})
