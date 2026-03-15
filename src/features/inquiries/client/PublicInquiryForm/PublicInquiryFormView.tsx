"use client"

import type { BaseSyntheticEvent } from "react"
import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  EMAIL_DOMAIN_OPTIONS,
  INQUIRY_TYPE_OPTIONS,
  type InquiryFormValues,
  type InquiryType,
} from "./PublicInquiryForm.types"

type PublicInquiryFormViewProps = {
  control: Control<InquiryFormValues>
  register: UseFormRegister<InquiryFormValues>
  errors: FieldErrors<InquiryFormValues>
  isSubmitting: boolean
  domainOption: InquiryFormValues["emailDomainOption"]
  message: string
  messageType: "success" | "error" | null
  onSubmitAction: (event?: BaseSyntheticEvent) => Promise<void>
}

export function PublicInquiryFormView({
  control,
  register,
  errors,
  isSubmitting,
  domainOption,
  message,
  messageType,
  onSubmitAction,
}: PublicInquiryFormViewProps) {
  return (
    <form onSubmit={onSubmitAction} className="mt-8 space-y-5">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8">
        <div className="space-y-2">
          <label htmlFor="inquiry-type" className="text-sm text-[#6d7077]">
            문의 유형
          </label>
          <Controller
            name="inquiryType"
            control={control}
            rules={{ required: "문의 유형을 선택해 주세요." }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value as InquiryType)}
              >
                <SelectTrigger
                  id="inquiry-type"
                  className="h-12 rounded-none border-[#d8d8d8] bg-white text-base"
                >
                  <SelectValue placeholder="문의 유형을 선택해 주세요." />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#d8d8d8] p-0">
                  {INQUIRY_TYPE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="h-12 rounded-none px-4 text-[16px]"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.inquiryType ? (
            <p className="text-xs text-rose-600">
              {errors.inquiryType.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="inquiry-email-local"
            className="text-sm text-[#6d7077]"
          >
            답변 받으실 이메일 주소
          </label>

          {domainOption === "직접입력" ? (
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_120px] gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_140px]">
              <Input
                id="inquiry-email-local"
                placeholder="이메일 아이디"
                className="h-12 rounded-none border-[#d8d8d8] px-4 text-base"
                {...register("emailLocal", {
                  required: "답변 받으실 이메일 주소를 입력해 주세요.",
                })}
              />
              <div className="grid h-12 place-items-center text-base text-[#6d7077]">
                @
              </div>
              <Input
                id="inquiry-email-domain-custom"
                placeholder="이메일 도메인을 입력해 주세요."
                className="h-12 rounded-none border-[#d8d8d8] px-4 text-base"
                {...register("emailDomainCustom", {
                  required: "이메일 도메인을 입력해 주세요.",
                })}
              />
              <Controller
                name="emailDomainOption"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-12 rounded-none border-[#d8d8d8] bg-white text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-[#d8d8d8] p-0">
                      {EMAIL_DOMAIN_OPTIONS.map((option) => (
                        <SelectItem
                          key={option}
                          value={option}
                          className="h-12 rounded-none px-4 text-[16px]"
                        >
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          ) : (
            <div className="grid grid-cols-[minmax(0,1fr)_auto_120px] gap-2 md:grid-cols-[minmax(0,1fr)_auto_140px]">
              <Input
                id="inquiry-email-local"
                placeholder="이메일 아이디"
                className="h-12 rounded-none border-[#d8d8d8] px-4 text-base"
                {...register("emailLocal", {
                  required: "답변 받으실 이메일 주소를 입력해 주세요.",
                })}
              />
              <div className="grid h-12 place-items-center text-base text-[#6d7077]">
                @
              </div>
              <Controller
                name="emailDomainOption"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-12 rounded-none border-[#d8d8d8] bg-white text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-[#d8d8d8] p-0">
                      {EMAIL_DOMAIN_OPTIONS.map((option) => (
                        <SelectItem
                          key={option}
                          value={option}
                          className="h-12 rounded-none px-4 text-[16px]"
                        >
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {errors.emailLocal || errors.emailDomainCustom ? (
            <p className="text-xs text-rose-600">
              {errors.emailLocal?.message || errors.emailDomainCustom?.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="inquiry-content" className="text-sm text-[#6d7077]">
          문의 내용
        </label>
        <textarea
          id="inquiry-content"
          placeholder="문의하실 내용을 입력해 주세요."
          className="min-h-[360px] w-full rounded-none border border-[#d8d8d8] bg-white px-4 py-4 text-[15px] leading-7 outline-none placeholder:text-[#b5b8be]"
          {...register("content", {
            required: "문의 내용을 입력해 주세요.",
            minLength: {
              value: 5,
              message: "문의 내용은 5자 이상 입력해 주세요.",
            },
          })}
        />
        {errors.content ? (
          <p className="text-xs text-rose-600">{errors.content.message}</p>
        ) : null}
      </div>

      {message ? (
        <output
          className={`block rounded-sm border px-3 py-2 text-sm ${
            messageType === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
          aria-live="polite"
        >
          {message}
        </output>
      ) : null}

      <div className="pt-2 text-center">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 min-w-[170px] rounded-sm bg-[#b7242a] text-base font-semibold text-white hover:bg-[#a51f25]"
        >
          {isSubmitting ? "전송중..." : "전송하기"}
        </Button>
      </div>
    </form>
  )
}
