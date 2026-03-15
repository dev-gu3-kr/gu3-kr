"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  INITIAL_VALUES,
  type InquiryFormValues,
} from "./PublicInquiryForm.types"
import { PublicInquiryFormView } from "./PublicInquiryFormView"

export function PublicInquiryFormContainer() {
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({ defaultValues: INITIAL_VALUES })

  const domainOption = watch("emailDomainOption")

  const onSubmit = handleSubmit(async (values) => {
    setMessage("")
    setMessageType(null)
    clearErrors()

    if (!values.inquiryType) {
      setError("inquiryType", {
        type: "required",
        message: "문의 유형을 선택해 주세요.",
      })
      return
    }

    const domain =
      values.emailDomainOption === "직접입력"
        ? values.emailDomainCustom.trim()
        : values.emailDomainOption

    const email = `${values.emailLocal.trim()}@${domain}`
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      setError("emailLocal", {
        type: "pattern",
        message: "답변 받으실 이메일 주소를 올바르게 입력해 주세요.",
      })
      return
    }

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType: values.inquiryType,
          email,
          content: values.content,
          isPrivate: true,
        }),
      })

      const json = await response.json().catch(() => null)

      if (!response.ok || !json?.ok) {
        const errorMessage =
          json?.message ?? "문의 등록에 실패했습니다. 입력값을 확인해 주세요."
        setMessage(errorMessage)
        setMessageType("error")
        toast.error(errorMessage)
        return
      }

      reset(INITIAL_VALUES)
      setMessage("문의가 정상 등록되었습니다. 담당자가 확인 후 답변드릴게요.")
      setMessageType("success")
      toast.success("문의가 정상 등록되었습니다.")
    } catch {
      const networkErrorMessage =
        "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      setMessage(networkErrorMessage)
      setMessageType("error")
      toast.error(networkErrorMessage)
    }
  })

  return (
    <PublicInquiryFormView
      control={control}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      domainOption={domainOption}
      message={message}
      messageType={messageType}
      onSubmitAction={onSubmit}
    />
  )
}
