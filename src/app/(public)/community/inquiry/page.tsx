"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { SubLanding } from "@/components/SubLanding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type InquiryFormValues = {
  title: string
  email: string
  phone: string
  content: string
  isPrivate: boolean
}

const INITIAL_VALUES: InquiryFormValues = {
  title: "",
  email: "",
  phone: "",
  content: "",
  isPrivate: true,
}

export default function Page() {
  const [message, setMessage] = React.useState("")
  const [messageType, setMessageType] = React.useState<
    "success" | "error" | null
  >(null)

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    getValues,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    defaultValues: INITIAL_VALUES,
  })

  const onSubmit = async (values: InquiryFormValues) => {
    setMessage("")
    setMessageType(null)

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, isPrivate: true }),
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
      clearErrors()
      const successMessage =
        "문의가 정상 등록되었습니다. 담당자가 확인 후 연락드릴게요."
      setMessage(successMessage)
      setMessageType("success")
      toast.success("문의가 정상 등록되었습니다.")
    } catch {
      const networkErrorMessage =
        "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      setMessage(networkErrorMessage)
      setMessageType("error")
      toast.error(networkErrorMessage)
    }
  }

  return (
    <>
      <SubLanding title="" sectionLabel="공동체 마당" currentLabel="1:1 문의" />

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#252629] md:text-3xl">
          1:1 문의
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 rounded-xl border border-[#e7e7ea] bg-white p-5 md:p-8"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="inquiry-title"
                className="text-sm font-medium text-[#252629]"
              >
                제목
              </label>
              <Input
                id="inquiry-title"
                placeholder="문의 제목을 입력해 주세요"
                {...register("title", {
                  required: "제목을 입력해 주세요.",
                  minLength: {
                    value: 2,
                    message: "제목은 2자 이상 입력해 주세요.",
                  },
                })}
              />
              {errors.title ? (
                <p className="text-xs text-rose-600">{errors.title.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="inquiry-email"
                className="text-sm font-medium text-[#252629]"
              >
                이메일
              </label>
              <Input
                id="inquiry-email"
                type="email"
                placeholder="example@email.com"
                {...register("email", {
                  validate: (value) => {
                    const hasPhone = Boolean(getValues("phone")?.trim())
                    if (!value?.trim() && !hasPhone) {
                      return "이메일 또는 연락처 중 하나는 반드시 입력해 주세요."
                    }
                    return true
                  },
                  onBlur: () => {
                    void trigger("phone")
                  },
                })}
              />
              {errors.email ? (
                <p className="text-xs text-rose-600">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="inquiry-phone"
                className="text-sm font-medium text-[#252629]"
              >
                연락처
              </label>
              <Input
                id="inquiry-phone"
                placeholder="010-0000-0000"
                {...register("phone", {
                  validate: (value) => {
                    const hasEmail = Boolean(getValues("email")?.trim())
                    if (!value?.trim() && !hasEmail) {
                      return "이메일 또는 연락처 중 하나는 반드시 입력해 주세요."
                    }
                    return true
                  },
                  onBlur: () => {
                    void trigger("email")
                  },
                })}
              />
              {errors.phone ? (
                <p className="text-xs text-rose-600">{errors.phone.message}</p>
              ) : (
                <p className="text-xs text-[#7a7d84]">
                  이메일 또는 연락처 중 하나는 반드시 입력해 주세요.
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="inquiry-content"
                className="text-sm font-medium text-[#252629]"
              >
                문의 내용
              </label>
              <textarea
                id="inquiry-content"
                placeholder="문의하실 내용을 작성해 주세요"
                className="min-h-[240px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                {...register("content", {
                  required: "문의 내용을 입력해 주세요.",
                  minLength: {
                    value: 5,
                    message: "문의 내용은 5자 이상 입력해 주세요.",
                  },
                })}
              />
              {errors.content ? (
                <p className="text-xs text-rose-600">
                  {errors.content.message}
                </p>
              ) : null}
            </div>
          </div>

          {message ? (
            <output
              className={`mt-4 block rounded-md border px-3 py-2 text-sm ${
                messageType === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
              aria-live="polite"
            >
              {message}
            </output>
          ) : null}

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "등록 중..." : "문의 등록"}
            </Button>
          </div>
        </form>
      </section>
    </>
  )
}
