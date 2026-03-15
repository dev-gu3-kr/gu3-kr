"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  useInquiryDetailQuery,
  useInquiryNoteMutation,
  useInquiryStatusMutation,
} from "@/features/inquiries/isomorphic"

import { InquiryDetailView } from "./InquiryDetailView"

export function InquiryDetailContainer() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const {
    data: inquiry,
    isLoading,
    isError,
    refetch,
  } = useInquiryDetailQuery(id)
  const statusMutation = useInquiryStatusMutation(id)
  const noteMutation = useInquiryNoteMutation(id)

  const [note, setNote] = useState("")
  const [copiedEmail, setCopiedEmail] = useState(false)

  useEffect(() => {
    setNote(inquiry?.processingMemo ?? "")
  }, [inquiry?.processingMemo])

  const handleStatusChange = (value: string) => {
    if (value !== "RECEIVED" && value !== "IN_PROGRESS" && value !== "DONE") {
      return
    }

    if (!inquiry || value === inquiry.status || statusMutation.isPending) {
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

  const handleSubmitNote = () => {
    if (!id || noteMutation.isPending) return

    noteMutation.mutate(note, {
      onSuccess: () => {
        toast.success("문의 메모가 저장되었습니다.")
      },
      onError: (error) => {
        toast.error(error.message || "문의 메모 저장에 실패했습니다.")
      },
    })
  }

  const handleCopyEmail = async () => {
    const emailValue = inquiry?.email?.trim() || ""
    if (!emailValue) return

    try {
      await navigator.clipboard.writeText(emailValue)
      setCopiedEmail(true)
      toast.success("이메일을 복사했습니다.")
      setTimeout(() => setCopiedEmail(false), 1200)
    } catch {
      toast.error("이메일 복사에 실패했습니다.")
    }
  }

  if (!inquiry) {
    return (
      <InquiryDetailView
        inquiry={{
          id: "",
          title: null,
          inquiryType: "OTHER",
          email: null,
          phone: null,
          content: "",
          status: "RECEIVED",
          isPrivate: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          processedAt: null,
          processingMemo: null,
          processedById: null,
        }}
        note={note}
        isLoading={isLoading}
        isError={isError}
        isStatusPending={statusMutation.isPending}
        isNoteSubmitting={noteMutation.isPending}
        copiedEmail={copiedEmail}
        onRetry={() => {
          void refetch()
        }}
        onNoteChange={setNote}
        onStatusChange={handleStatusChange}
        onSubmitNote={handleSubmitNote}
        onCopyEmail={() => {
          void handleCopyEmail()
        }}
      />
    )
  }

  return (
    <InquiryDetailView
      inquiry={inquiry}
      note={note}
      isLoading={isLoading}
      isError={isError}
      isStatusPending={statusMutation.isPending}
      isNoteSubmitting={noteMutation.isPending}
      copiedEmail={copiedEmail}
      onRetry={() => {
        void refetch()
      }}
      onNoteChange={setNote}
      onStatusChange={handleStatusChange}
      onSubmitNote={handleSubmitNote}
      onCopyEmail={() => {
        void handleCopyEmail()
      }}
    />
  )
}
