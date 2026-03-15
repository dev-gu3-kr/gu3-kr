"use client"

import { format, formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Check, Copy, Mail } from "lucide-react"

import { AppLink as Link } from "@/components/AppLink"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type {
  InquiryDetailDto,
  InquiryStatusDto,
} from "@/features/inquiries/isomorphic"

const STATUS_LABEL: Record<InquiryStatusDto, string> = {
  RECEIVED: "접수",
  IN_PROGRESS: "처리중",
  DONE: "완료",
}

const STATUS_BADGE_CLASSNAME: Record<InquiryStatusDto, string> = {
  RECEIVED: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-emerald-100 text-emerald-700",
}

const INQUIRY_TYPE_LABEL = {
  MASS_SACRAMENT: "미사 및 성사 문의",
  CATECHUMEN_CLASS: "예비신자 / 교리 문의",
  FAITH_PARISH_LIFE: "신앙 및 본당 생활 문의",
  FACILITY_RENTAL: "시설 및 대관 문의",
  WEBSITE_ONLINE: "홈페이지 및 온라인 서비스 문의",
  VOLUNTEER_DONATION: "봉사 및 후원 문의",
  OTHER: "기타 문의",
} as const

type InquiryDetailViewProps = {
  inquiry: InquiryDetailDto
  note: string
  isLoading: boolean
  isError: boolean
  isStatusPending: boolean
  isNoteSubmitting: boolean
  copiedEmail: boolean
  onRetry: () => void
  onNoteChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSubmitNote: () => void
  onCopyEmail: () => void
}

export function InquiryDetailView({
  inquiry,
  note,
  isLoading,
  isError,
  isStatusPending,
  isNoteSubmitting,
  copiedEmail,
  onRetry,
  onNoteChange,
  onStatusChange,
  onSubmitNote,
  onCopyEmail,
}: InquiryDetailViewProps) {
  if (isLoading) {
    return (
      <main className="space-y-4">
        <div className="h-6 w-2/5 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
      </main>
    )
  }

  if (isError) {
    return (
      <main className="space-y-4">
        <p className="text-sm text-red-600">문의 상세를 불러오지 못했습니다.</p>
        <Button variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      </main>
    )
  }

  const effectiveStatus = inquiry.status
  const emailValue = inquiry.email?.trim() || ""

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/inquiries"
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 목록으로
        </Link>

        <span
          className={`rounded px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASSNAME[effectiveStatus]}`}
        >
          {STATUS_LABEL[effectiveStatus]}
        </span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">
        {INQUIRY_TYPE_LABEL[inquiry.inquiryType]}
      </h1>

      <p className="text-xs text-neutral-500">
        {format(new Date(inquiry.createdAt), "yyyy.MM.dd HH:mm")} ·{" "}
        {formatDistanceToNow(new Date(inquiry.createdAt), {
          addSuffix: true,
          locale: ko,
        })}
      </p>

      <div className="flex items-center justify-between gap-3 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
        <p>이메일: {emailValue || "-"}</p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCopyEmail}
            disabled={!emailValue}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-neutral-300 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="이메일 복사"
            title={copiedEmail ? "복사됨" : "이메일 복사"}
          >
            {copiedEmail ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          <a
            href={emailValue ? `mailto:${emailValue}` : undefined}
            onClick={(event) => {
              if (!emailValue) event.preventDefault()
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-neutral-300 text-neutral-600 transition hover:bg-neutral-100"
            aria-label="메일 보내기"
            title="메일 보내기"
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <article className="whitespace-pre-wrap text-sm leading-6 text-neutral-900">
        {inquiry.content}
      </article>

      <div className="border-t border-neutral-200 pt-5">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">
            처리 상태 변경
          </h2>

          <ToggleGroup
            type="single"
            value={effectiveStatus}
            onValueChange={onStatusChange}
            className="justify-start"
          >
            <ToggleGroupItem
              value="RECEIVED"
              aria-label="접수"
              disabled={isStatusPending}
            >
              접수
            </ToggleGroupItem>
            <ToggleGroupItem
              value="IN_PROGRESS"
              aria-label="처리중"
              disabled={isStatusPending}
            >
              처리중
            </ToggleGroupItem>
            <ToggleGroupItem
              value="DONE"
              aria-label="완료"
              disabled={isStatusPending}
            >
              완료
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="space-y-2">
            <label
              htmlFor="inquiry-note"
              className="text-sm font-medium text-neutral-800"
            >
              처리 메모
            </label>
            <Input
              id="inquiry-note"
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="예: 유선 연락 완료 / 추가 확인 필요"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={onSubmitNote} disabled={isNoteSubmitting}>
              {isNoteSubmitting ? "저장 중..." : "메모 저장"}
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
