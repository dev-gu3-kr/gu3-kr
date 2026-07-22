"use client"

import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { DayPicker } from "react-day-picker"
import { createPortal } from "react-dom"

const POPOVER_WIDTH = 320
const POPOVER_ESTIMATED_HEIGHT = 363
const POPOVER_GAP = 8
const VIEWPORT_PADDING = 8

type PopoverLayout = {
  container: HTMLElement
  position: "absolute" | "fixed"
  top: number
  left: number
  width: number
}

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
  const [popoverLayout, setPopoverLayout] = useState<PopoverLayout | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  const selected = useMemo(() => toDate(value), [value])
  const minDate = useMemo(() => toDate(min || ""), [min])

  const measurePopoverLayout = useCallback((): PopoverLayout | null => {
    const wrapper = wrapperRef.current
    if (!wrapper) return null

    const triggerRect = wrapper.getBoundingClientRect()
    const width = Math.min(
      POPOVER_WIDTH,
      Math.max(0, window.innerWidth - VIEWPORT_PADDING * 2),
    )
    const height = Math.min(
      popoverRef.current?.offsetHeight ?? POPOVER_ESTIMATED_HEIGHT,
      Math.max(0, window.innerHeight - VIEWPORT_PADDING * 2),
    )
    const spaceBelow = window.innerHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top
    const openUpward =
      spaceBelow < height + POPOVER_GAP && spaceAbove > spaceBelow
    const desiredTop = openUpward
      ? triggerRect.top - height - POPOVER_GAP
      : triggerRect.bottom + POPOVER_GAP
    const maxTop = Math.max(
      VIEWPORT_PADDING,
      window.innerHeight - height - VIEWPORT_PADDING,
    )
    const top = Math.min(Math.max(desiredTop, VIEWPORT_PADDING), maxTop)
    const maxLeft = Math.max(
      VIEWPORT_PADDING,
      window.innerWidth - width - VIEWPORT_PADDING,
    )
    const left = Math.min(Math.max(triggerRect.left, VIEWPORT_PADDING), maxLeft)

    // 수정 팝업의 스크롤 경계가 달력을 자르지 않도록 대화상자 직속으로 포털링한다.
    const dialog = wrapper.closest<HTMLElement>('[role="dialog"]')
    const container = dialog ?? document.body
    const containerRect = dialog?.getBoundingClientRect()

    return {
      container,
      position: dialog ? "absolute" : "fixed",
      top: containerRect ? top - containerRect.top : top,
      left: containerRect ? left - containerRect.left : left,
      width,
    }
  }, [])

  const updatePopoverLayout = useCallback(() => {
    const next = measurePopoverLayout()
    if (!next) return

    setPopoverLayout((current) => {
      if (
        current?.container === next.container &&
        current.position === next.position &&
        current.top === next.top &&
        current.left === next.left &&
        current.width === next.width
      ) {
        return current
      }
      return next
    })
  }, [measurePopoverLayout])

  useLayoutEffect(() => {
    if (!open) return

    updatePopoverLayout()
    window.addEventListener("resize", updatePopoverLayout)
    window.addEventListener("scroll", updatePopoverLayout, true)
    return () => {
      window.removeEventListener("resize", updatePopoverLayout)
      window.removeEventListener("scroll", updatePopoverLayout, true)
    }
  }, [open, updatePopoverLayout])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!open) return
      const target = event.target as Node | null
      if (!wrapperRef.current || !target) return
      if (
        !wrapperRef.current.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
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
          aria-expanded={open}
          aria-controls={`${id}-popover`}
          onClick={() => {
            if (open) {
              setOpen(false)
              return
            }
            const nextLayout = measurePopoverLayout()
            if (!nextLayout) return
            setPopoverLayout(nextLayout)
            setOpen(true)
          }}
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

        {open && popoverLayout
          ? createPortal(
              <div
                id={`${id}-popover`}
                ref={popoverRef}
                style={{
                  position: popoverLayout.position,
                  top: popoverLayout.top,
                  left: popoverLayout.left,
                  width: popoverLayout.width,
                }}
                className="pointer-events-auto z-[120] max-h-[calc(100vh-1rem)] overflow-y-auto rounded-md border bg-white p-3 shadow-lg"
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
              </div>,
              popoverLayout.container,
            )
          : null}
      </div>

      {errorMessage ? (
        <p className="text-xs text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  )
}
