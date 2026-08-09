import { describe, expect, it } from "vitest"

import { homePageMock } from "./home.mock"

describe("homePageMock board items", () => {
  it("uses a unique item id within each board column", () => {
    for (const column of homePageMock.boardColumns) {
      const ids = column.items.map((item) => item.id)

      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})
