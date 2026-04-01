import { z } from "zod"

// 소개 카드 입력 스키마: 이미지 1장 + 제목 + 내용 조합을 강제한다.
export const createIntroPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "제목은 필수 입력입니다.")
    .max(120, "제목은 120자 이하로 입력해 주세요."),
  imageUrl: z
    .string()
    .trim()
    .min(1, "대표 이미지는 필수 입력입니다.")
    .url("대표 이미지 URL 형식이 올바르지 않습니다."),
  content: z.string().trim().min(1, "내용은 필수 입력입니다."),
  isPublished: z.boolean().optional(),
})
