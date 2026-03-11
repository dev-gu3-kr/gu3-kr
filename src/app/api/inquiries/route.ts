import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const createInquirySchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    content: z.string().trim().min(5).max(5000),
    email: z
      .string()
      .trim()
      .email()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
    isPrivate: z.boolean().optional().default(true),
  })
  .superRefine((value, ctx) => {
    if (!value.email && !value.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "이메일 또는 연락처 중 하나는 필수입니다.",
      })
    }
  })

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = createInquirySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "입력값이 올바르지 않습니다. 이메일 또는 연락처 중 하나는 필수입니다.",
      },
      { status: 400 },
    )
  }

  const created = await prisma.inquiry.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      email: parsed.data.email,
      phone: parsed.data.phone,
      isPrivate: parsed.data.isPrivate,
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, id: created.id })
}
