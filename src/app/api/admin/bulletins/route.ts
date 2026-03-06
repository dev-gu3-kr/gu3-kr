import { randomUUID } from "node:crypto"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { assertAdminSession } from "@/lib/admin/session"
import { createTimestampSlug } from "@/lib/admin/slug"
import { getMinioS3Client } from "@/lib/admin/storage"
import { prisma } from "@/lib/prisma"

// 관리자 API 라우트: 본당주보 목록 조회와 파일 업로드 기반 생성을 처리한다.

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.

// 로그인한 관리자 세션 유효성을 검사한다.

// 주보 첨부파일 업로드를 위한 MinIO(S3 호환) 클라이언트를 생성한다.

// 주보 slug를 생성한다.

// 본당주보 목록을 페이지네이션/검색/공개상태 필터와 함께 조회한다.
export async function GET(request: Request) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const takeParam = Number(searchParams.get("take") || 20)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 100)
    : 20
  const cursor = searchParams.get("cursor") || undefined
  // 목록 필터: 제목 검색어 + 공개 상태(전체/공개/비공개)
  const query = (searchParams.get("query") || "").trim()
  const status = searchParams.get("status")

  const rows = await prisma.post.findMany({
    where: {
      category: "BULLETIN",
      ...(query
        ? {
            title: {
              contains: query,
            },
          }
        : {}),
      ...(status === "published"
        ? { isPublished: true }
        : status === "draft"
          ? { isPublished: false }
          : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      title: true,
      isPublished: true,
      createdAt: true,
      attachments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          url: true,
          originalName: true,
        },
      },
    },
  })

  // take+1로 더 가져온 뒤 다음 페이지 존재 여부를 계산한다.
  const hasMore = rows.length > take
  const items = hasMore ? rows.slice(0, take) : rows
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return NextResponse.json({
    ok: true,
    items,
    pageInfo: { hasMore, nextCursor, take },
  })
}

// 본당주보를 첨부파일과 함께 생성한다.
export async function POST(request: Request) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const formData = await request.formData()
  const title = String(formData.get("title") || "").trim()
  const content = String(formData.get("content") || "").trim()
  const isPublished = String(formData.get("isPublished") || "true") === "true"
  const file = formData.get("file")

  if (!title) {
    return NextResponse.json(
      { ok: false, message: "제목은 필수입니다." },
      { status: 400 },
    )
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, message: "주보파일은 필수입니다." },
      { status: 400 },
    )
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, message: "파일 용량은 20MB 이하여야 합니다." },
      { status: 400 },
    )
  }

  const ext = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : ""
  const allowedExt = new Set(["pdf", "doc", "docx", "hwp", "hwpx"])

  if (!ext || !allowedExt.has(ext)) {
    return NextResponse.json(
      { ok: false, message: "허용되지 않은 파일 형식입니다." },
      { status: 400 },
    )
  }

  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!bucket) {
    return NextResponse.json(
      { ok: false, message: "버킷 설정이 비어 있습니다." },
      { status: 500 },
    )
  }

  const key = `cathedral/bulletins/${Date.now()}-${randomUUID()}.${ext}`
  const client = getMinioS3Client()

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || "application/octet-stream",
    }),
  )

  const endpoint = (process.env.MINIO_ENDPOINT || "").replace(/\/$/, "")
  const fileUrl = `${endpoint}/${bucket}/${key}`

  const created = await prisma.post.create({
    data: {
      category: "BULLETIN",
      title,
      slug: createTimestampSlug(title, "bulletin"),
      content,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      authorId: author.id,
      attachments: {
        create: {
          fileName: key.split("/").pop() || file.name,
          originalName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          url: fileUrl,
        },
      },
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, id: created.id })
}
