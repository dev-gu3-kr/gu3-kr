"use client"

import { useQueryClient } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { AppLink as Link } from "@/components/AppLink"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  useInquiryDetailQuery,
  useInquiryStatusMutation,
} from "@/features/inquiries/isomorphic"

type InquiryStatus = "RECEIVED" | "IN_PROGRESS" | "DONE"

const STATUS_LABEL: Record<InquiryStatus, string> = {
  RECEIVED: "접수",
  IN_PROGRESS: "처리중",
  DONE: "완료",
}

const STATUS_BADGE_CLASSNAME: Record<InquiryStatus, string> = {
  RECEIVED: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-emerald-100 text-emerald-700",
}

export default function AdminInquiryViewPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const {
    data: inquiry,
    isLoading,
    isError,
    refetch,
  } = useInquiryDetailQuery(id)
  const statusMutation = useInquiryStatusMutation(id)
  const queryClient = useQueryClient()

  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setNote(inquiry?.processingMemo ?? "")
  }, [inquiry?.processingMemo])

  const effectiveStatus = (inquiry?.status || "RECEIVED") as InquiryStatus

  const submitUpdate = async () => {
    if (!id || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      })

      const json = await response.json().catch(() => null)

      if (!response.ok || !json?.ok) {
        toast.error(json?.message ?? "문의 메모 저장에 실패했습니다.")
        return
      }

      toast.success("문의 메모가 저장되었습니다.")
      await refetch()
      await queryClient.invalidateQueries({
        queryKey: ["admin", "inquiries", "list"],
      })
    } catch {
      toast.error("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = (value: string) => {
    if (value !== "RECEIVED" && value !== "IN_PROGRESS" && value !== "DONE") {
      return
    }

    if (value === effectiveStatus || statusMutation.isPending) {
      return
    }

    statusMutation.mutate(value, {
      onSuccess: () => {
        toast.success("문의 상태가 업데이트되었습니다.")
      },
      onError: () => {
        toast.error("문의 상태 업데이트에 실패했습니다.")
      },
    })
  }

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

  if (isError || !inquiry) {
    return (
      <main className="space-y-4">
        <p className="text-sm text-red-600">문의 상세를 불러오지 못했습니다.</p>
      </main>
    )
  }

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

      <h1 className="text-2xl font-semibold tracking-tight">{inquiry.title}</h1>

      <p className="text-xs text-neutral-500">
        {format(new Date(inquiry.createdAt), "yyyy.MM.dd HH:mm")} ·{" "}
        {formatDistanceToNow(new Date(inquiry.createdAt), {
          addSuffix: true,
          locale: ko,
        })}
      </p>

      <div className="grid gap-2 rounded-md bg-neutral-50 p-3 text-sm text-neutral-700 md:grid-cols-2">
        <p>이메일: {inquiry.email || "-"}</p>
        <p>연락처: {inquiry.phone || "-"}</p>
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
            onValueChange={handleStatusChange}
            className="justify-start"
          >
            <ToggleGroupItem
              value="RECEIVED"
              aria-label="접수"
              disabled={statusMutation.isPending}
            >
              접수
            </ToggleGroupItem>
            <ToggleGroupItem
              value="IN_PROGRESS"
              aria-label="처리중"
              disabled={statusMutation.isPending}
            >
              처리중
            </ToggleGroupItem>
            <ToggleGroupItem
              value="DONE"
              aria-label="완료"
              disabled={statusMutation.isPending}
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
              onChange={(event) => setNote(event.target.value)}
              placeholder="예: 유선 연락 완료 / 추가 확인 필요"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={submitUpdate} disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "메모 저장"}
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
