"use client"

import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { DayPicker } from "react-day-picker"

function toDate(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function toLocalDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function DateTimePicker({
  id,
  label,
  value,
  onChange,
  min,
  required = true,
  errorMessage,
}: {
  id: string
  label: string
  value: string
  onChange: (next: string) => void
  min?: string
  required?: boolean
  errorMessage?: string
}) {
  const [open, setOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const selected = useMemo(() => toDate(value), [value])
  const minDate = useMemo(() => toDate(min || ""), [min])

  useEffect(() => {
    if (!open || !wrapperRef.current) return

    const rect = wrapperRef.current.getBoundingClientRect()
    const estimatedHeight = 360
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    setOpenUpward(spaceBelow < estimatedHeight && spaceAbove > spaceBelow)
  }, [open])

  // 외부 클릭/Escape 입력 시 팝업을 닫아 모달 없이도 자연스럽게 조작되게 한다.
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!open) return
      const target = event.target as Node | null
      if (!wrapperRef.current || !target) return
      if (!wrapperRef.current.contains(target)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const hour = selected ? String(selected.getHours()).padStart(2, "0") : "09"
  const minute = selected
    ? String(selected.getMinutes()).padStart(2, "0")
    : "00"

  const updateTime = (nextHour: string, nextMinute: string) => {
    const base = selected ?? new Date()
    const date = new Date(base)
    date.setHours(Number(nextHour), Number(nextMinute), 0, 0)
    onChange(toLocalDateTime(date))
  }

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>

      <div ref={wrapperRef} className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={
            errorMessage
              ? "flex w-full items-center justify-between rounded-md border border-red-500 px-3 py-2 text-left text-sm ring-1 ring-red-500"
              : "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm"
          }
        >
          <span className={selected ? "text-neutral-900" : "text-neutral-500"}>
            {selected
              ? format(selected, "yyyy.MM.dd HH:mm", { locale: ko })
              : `${label} 선택`}
          </span>
          <CalendarDays className="h-4 w-4 text-neutral-400" />
        </button>

        {open ? (
          <div
            className={
              openUpward
                ? "absolute bottom-full z-[80] mb-2 w-[320px] rounded-md border bg-white p-3 shadow-lg"
                : "absolute z-[80] mt-2 w-[320px] rounded-md border bg-white p-3 shadow-lg"
            }
          >
            <DayPicker
              mode="single"
              locale={ko}
              selected={selected ?? undefined}
              month={selected ?? undefined}
              onSelect={(date) => {
                if (!date) return
                const next = new Date(date)
                next.setHours(Number(hour), Number(minute), 0, 0)
                if (minDate && next < minDate) {
                  onChange(toLocalDateTime(minDate))
                  return
                }
                onChange(toLocalDateTime(next))
                // day 선택 즉시 닫아 추가 클릭 없이 입력 흐름을 끝낸다.
                setOpen(false)
              }}
              disabled={minDate ? { before: minDate } : undefined}
            />

            <div className="mt-2 flex items-center gap-2">
              <select
                value={hour}
                onChange={(event) => updateTime(event.target.value, minute)}
                className="rounded-md border px-2 py-1 text-sm"
              >
                {Array.from({ length: 24 }).map((_, index) => {
                  const v = String(index).padStart(2, "0")
                  return (
                    <option key={v} value={v}>
                      {v}시
                    </option>
                  )
                })}
              </select>

              <select
                value={minute}
                onChange={(event) => updateTime(hour, event.target.value)}
                className="rounded-md border px-2 py-1 text-sm"
              >
                {["00", "10", "20", "30", "40", "50"].map((v) => (
                  <option key={v} value={v}>
                    {v}분
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="text-xs text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  )
}
