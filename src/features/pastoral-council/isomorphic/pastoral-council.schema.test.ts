import { describe, expect, it } from "vitest"
import { upsertPastoralCouncilPositionSchema } from "./pastoral-council.schema"

describe("upsertPastoralCouncilPositionSchema", () => {
  it("배치 설정을 생략하면 자동 2열로 정규화한다", () => {
    const result = upsertPastoralCouncilPositionSchema.parse({
      title: "총 회장",
    })

    expect(result.childrenLayout).toBe("AUTO")
    expect(result.childrenColumns).toBe(2)
  })

  it("그리드 열 수는 1개부터 4개까지만 허용한다", () => {
    expect(
      upsertPastoralCouncilPositionSchema.safeParse({
        title: "총 회장",
        childrenLayout: "GRID",
        childrenColumns: 4,
      }).success,
    ).toBe(true)
    expect(
      upsertPastoralCouncilPositionSchema.safeParse({
        title: "총 회장",
        childrenLayout: "GRID",
        childrenColumns: 5,
      }).success,
    ).toBe(false)
  })
})
