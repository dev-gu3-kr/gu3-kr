import type { InquiryStatus, InquiryType } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export async function findInquiryPageRows(params: {
  take: number
  cursor?: string
  query?: string
  status?: "all" | InquiryStatus
  inquiryType?: "all" | InquiryType
}) {
  return prisma.inquiry.findMany({
    where: {
      ...(params.status && params.status !== "all"
        ? { status: params.status }
        : {}),
      ...(params.inquiryType && params.inquiryType !== "all"
        ? { inquiryType: params.inquiryType }
        : {}),
      ...(params.query
        ? {
            OR: [
              { title: { contains: params.query } },
              { content: { contains: params.query } },
              { email: { contains: params.query } },
              { phone: { contains: params.query } },
              { processingMemo: { contains: params.query } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: params.take + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      inquiryType: true,
      email: true,
      phone: true,
      content: true,
      processingMemo: true,
      status: true,
      isPrivate: true,
      createdAt: true,
    },
  })
}

export async function findInquiryById(id: string) {
  return prisma.inquiry.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      inquiryType: true,
      email: true,
      phone: true,
      content: true,
      status: true,
      isPrivate: true,
      createdAt: true,
      updatedAt: true,
      processedAt: true,
      processingMemo: true,
      processedById: true,
    },
  })
}

export async function updateInquiryById(
  id: string,
  params: {
    status?: InquiryStatus
    processingMemo?: string | null
    processedAt?: Date | null
    processedById?: string | null
  },
) {
  return prisma.inquiry.update({
    where: { id },
    data: {
      ...(params.status ? { status: params.status } : {}),
      ...(params.processingMemo !== undefined
        ? { processingMemo: params.processingMemo }
        : {}),
      ...(params.processedAt !== undefined
        ? { processedAt: params.processedAt }
        : {}),
      ...(params.processedById !== undefined
        ? { processedById: params.processedById }
        : {}),
    },
    select: {
      id: true,
      title: true,
      inquiryType: true,
      email: true,
      phone: true,
      content: true,
      status: true,
      isPrivate: true,
      createdAt: true,
      updatedAt: true,
      processedAt: true,
      processingMemo: true,
      processedById: true,
    },
  })
}

export async function createInquiryRecord(params: {
  title?: string
  inquiryType: InquiryType
  content: string
  email?: string
  phone?: string
  isPrivate: boolean
}) {
  return prisma.inquiry.create({
    data: params,
    select: { id: true },
  })
}
