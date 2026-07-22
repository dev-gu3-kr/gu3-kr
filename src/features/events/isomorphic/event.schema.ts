import { z } from "zod"

const KOREA_UTC_OFFSET = "+09:00"
const KOREA_UTC_OFFSET_MS = 9 * 60 * 60 * 1000

const eventDateSchema = z.iso.date()
const eventLocalDateTimeSchema = z.iso.datetime({
  local: true,
  precision: -1,
})

export const eventDateTimeSchema = z.iso.datetime({ offset: true })

// 관리자 입력은 한국 표준시 기준이며, 서버 런타임 시간대와 무관한 UTC ISO 문자열로 전송한다.
export function toEventDateTimeIso(value: string) {
  const parsed = eventLocalDateTimeSchema.safeParse(value)
  if (!parsed.success) {
    throw new Error("일정 날짜 형식이 올바르지 않습니다.")
  }

  return new Date(`${parsed.data}:00${KOREA_UTC_OFFSET}`).toISOString()
}

// API가 반환한 절대 시각을 관리자 폼의 한국 표준시 로컬 입력 형식으로 복원한다.
export function toEventDateTimeLocal(value: string) {
  const date = parseEventDateTime(value)
  if (!date) {
    throw new Error("일정 날짜 형식이 올바르지 않습니다.")
  }

  const koreaDate = new Date(date.getTime() + KOREA_UTC_OFFSET_MS)
  const pad = (part: number) => String(part).padStart(2, "0")

  return `${koreaDate.getUTCFullYear()}-${pad(koreaDate.getUTCMonth() + 1)}-${pad(koreaDate.getUTCDate())}T${pad(koreaDate.getUTCHours())}:${pad(koreaDate.getUTCMinutes())}`
}

// 달력의 날짜 셀은 오전 9시, 시간 셀은 선택한 한국 시각으로 폼 초기값을 만든다.
export function toEventDateTimeFormValue(value: string) {
  const dateOnly = eventDateSchema.safeParse(value)
  if (dateOnly.success) return `${dateOnly.data}T09:00`

  return toEventDateTimeLocal(value)
}

// 시간대가 명시된 ISO datetime만 Date로 변환해 실행 환경별 해석 차이를 차단한다.
export function parseEventDateTime(value: string) {
  const parsed = eventDateTimeSchema.safeParse(value)
  if (!parsed.success) return null

  const date = new Date(parsed.data)
  return Number.isNaN(date.getTime()) ? null : date
}
