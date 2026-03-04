import { z } from "zod"

// 공지사항 작성/수정 입력 스키마다.
export const createNoticeSchema = z.object({
  // 공지 제목
  title: z.string().trim().min(1).max(120),
  // 공지 요약(선택)
  summary: z.string().trim().max(300).optional(),
  // 공지 본문(공백만 입력한 경우는 허용하지 않는다)
  content: z.string().trim().min(1),
  // 즉시 공개 여부
  isPublished: z.boolean().optional(),
})
