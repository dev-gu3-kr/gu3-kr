import { describe, expect, it } from "vitest"
import {
  parseEventDateTime,
  toEventDateTimeFormValue,
  toEventDateTimeIso,
  toEventDateTimeLocal,
} from "./event.schema"

describe("event datetime", () => {
  it("한국 시간 오전 9시를 UTC 자정으로 변환한다", () => {
    expect(toEventDateTimeIso("2026-07-25T09:00")).toBe(
      "2026-07-25T00:00:00.000Z",
    )
  })

  it("UTC ISO 값을 한국 시간 폼 값으로 복원한다", () => {
    expect(toEventDateTimeLocal("2026-07-25T00:00:00.000Z")).toBe(
      "2026-07-25T09:00",
    )
  })

  it("서버는 시간대 없는 datetime 요청을 거부한다", () => {
    expect(parseEventDateTime("2026-07-25T09:00")).toBeNull()
    expect(parseEventDateTime("2026-07-25T00:00:00.000Z")?.toISOString()).toBe(
      "2026-07-25T00:00:00.000Z",
    )
  })

  it("월간 달력의 날짜 셀은 오전 9시 폼 값으로 변환한다", () => {
    expect(toEventDateTimeFormValue("2026-07-23")).toBe("2026-07-23T09:00")
  })

  it("시간 달력의 선택 시각은 한국 시간 폼 값으로 변환한다", () => {
    expect(toEventDateTimeFormValue("2026-07-23T14:30:00+09:00")).toBe(
      "2026-07-23T14:30",
    )
  })
})
