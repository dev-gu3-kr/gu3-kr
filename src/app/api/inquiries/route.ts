import { NextResponse } from "next/server"
import { z } from "zod"
import { inquiryService } from "@/features/inquiries/server"

const INQUIRY_TYPE_VALUES = [
  "MASS_SACRAMENT",
  "CATECHUMEN_CLASS",
  "FAITH_PARISH_LIFE",
  "FACILITY_RENTAL",
  "WEBSITE_ONLINE",
  "VOLUNTEER_DONATION",
  "OTHER",
] as const

const createInquirySchema = z.object({
  inquiryType: z.enum(INQUIRY_TYPE_VALUES),
  title: z.string().trim().max(120).optional(),
  content: z.string().trim().min(5).max(5000),
  email: z.string().trim().email(),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  isPrivate: z.boolean().optional().default(true),
})

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = createInquirySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "입력값이 올바르지 않습니다. 필수 항목을 확인해 주세요.",
      },
      { status: 400 },
    )
  }

  const created = await inquiryService.createInquiry({
    title: parsed.data.title?.trim() || undefined,
    inquiryType: parsed.data.inquiryType,
    content: parsed.data.content,
    email: parsed.data.email,
    phone: parsed.data.phone,
    isPrivate: parsed.data.isPrivate,
  })

  return NextResponse.json({ ok: true, id: created.id })
}
