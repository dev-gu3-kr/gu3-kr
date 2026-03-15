import type { InquiryStatus, InquiryType } from "@prisma/client"
import {
  createInquiryRecord,
  findInquiryById,
  findInquiryPageRows,
  updateInquiryById,
} from "./inquiry.query"

export async function getInquiryPage(params: {
  take: number
  cursor?: string
  query?: string
  status?: "all" | InquiryStatus
  inquiryType?: "all" | InquiryType
}) {
  const rows = await findInquiryPageRows(params)
  const hasNextPage = rows.length > params.take
  const items = (hasNextPage ? rows.slice(0, params.take) : rows).map(
    (row) => ({
      ...row,
      summary: row.content.slice(0, 80),
      processingMemo: row.processingMemo ?? null,
    }),
  )

  return {
    items,
    nextCursor: hasNextPage ? (items[items.length - 1]?.id ?? null) : null,
  }
}

export async function getInquiryById(id: string) {
  return findInquiryById(id)
}

export async function updateInquiry(input: {
  id: string
  status?: InquiryStatus
  note?: string
  processedById: string
}) {
  const inquiry = await findInquiryById(input.id)
  if (!inquiry) return null

  const note = input.note?.trim()
  const nextStatus = input.status

  return updateInquiryById(input.id, {
    ...(nextStatus !== undefined
      ? {
          status: nextStatus,
          processedAt: nextStatus === "DONE" ? new Date() : null,
          processedById: nextStatus === "DONE" ? input.processedById : null,
        }
      : {}),
    ...(input.note !== undefined ? { processingMemo: note ? note : null } : {}),
  })
}

export async function createInquiry(input: {
  title?: string
  inquiryType: InquiryType
  content: string
  email?: string
  phone?: string
  isPrivate: boolean
}) {
  return createInquiryRecord(input)
}
