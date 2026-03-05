// 관리자 API 라우트: 요청 검증, 권한 확인, 서비스 호출을 통해 CRUD 계약을 제공한다.
import { randomUUID } from "node:crypto"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { assertAdminSession } from "@/lib/admin/session"
import { createTimestampSlug } from "@/lib/admin/slug"
import { getMinioS3Client } from "@/lib/admin/storage"
import { prisma } from "@/lib/prisma"

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.

// 관리자 세션 유효성을 검사한다.

// 업로드/삭제에 사용할 S3(MinIO) 클라이언트를 생성한다.

function toImageRecordFromUrl(url: string) {
  const fileName = url.split("/").pop() || `${Date.now()}.webp`
  return {
    fileName,
    originalName: fileName,
    mimeType: "image/webp",
    sizeBytes: 0,
    url,
    isCover: true,
    sortOrder: 0,
  }
}

async function uploadThumbnailFile(thumbnail: File) {
  const ext = thumbnail.name.includes(".")
    ? thumbnail.name.split(".").pop()?.toLowerCase()
    : ""
  const allowed = new Set(["jpg", "jpeg", "png", "webp", "gif"])
  if (!ext || !allowed.has(ext))
    throw new Error("허용되지 않는 이미지 형식입니다.")

  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!bucket) throw new Error("버킷 설정이 비어 있습니다.")

  const key = `cathedral/gallery/${Date.now()}-${randomUUID()}.${ext}`
  const client = getMinioS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await thumbnail.arrayBuffer()),
      ContentType: thumbnail.type || "application/octet-stream",
    }),
  )

  const endpoint = (process.env.MINIO_ENDPOINT || "").replace(/\/$/, "")
  const fileUrl = `${endpoint}/${bucket}/${key}`

  return {
    fileName: key.split("/").pop() || thumbnail.name,
    originalName: thumbnail.name,
    mimeType: thumbnail.type || "application/octet-stream",
    sizeBytes: thumbnail.size,
    url: fileUrl,
    isCover: true,
    sortOrder: 0,
  }
}

// 목록/상세 조회 요청을 처리한다.
export async function GET(request: Request) {
  const author = await assertAdminSession(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )

  const { searchParams } = new URL(request.url)
  const takeParam = Number(searchParams.get("take") || 20)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 100)
    : 20
  const cursor = searchParams.get("cursor") || undefined
  const query = (searchParams.get("query") || "").trim()
  const status = searchParams.get("status")

  const rows = await prisma.post.findMany({
    where: {
      category: "GALLERY",
      ...(query ? { title: { contains: query } } : {}),
      ...(status === "published"
        ? { isPublished: true }
        : status === "draft"
          ? { isPublished: false }
          : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      isPublished: true,
      createdAt: true,
      galleryImages: {
        orderBy: [
          { isCover: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
        take: 1,
        select: { url: true },
      },
    },
  })

  const hasMore = rows.length > take
  const items = (hasMore ? rows.slice(0, take) : rows).map((item) => ({
    id: item.id,
    title: item.title,
    isPublished: item.isPublished,
    createdAt: item.createdAt,
    thumbnailUrl: item.galleryImages[0]?.url ?? null,
  }))
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return NextResponse.json({
    ok: true,
    items,
    pageInfo: { hasMore, nextCursor },
  })
}

// 생성 요청을 처리한다.
// 이미지 업로드를 받아 공용 버킷에 저장하고 URL을 반환한다.
export async function POST(request: Request) {
  const author = await assertAdminSession(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )

  const formData = await request.formData()
  const title = String(formData.get("title") || "").trim()
  const content = String(formData.get("content") || "").trim()
  const isPublished = String(formData.get("isPublished") || "true") === "true"
  const thumbnailUrl = String(formData.get("thumbnailUrl") || "").trim()
  const thumbnail = formData.get("thumbnail")

  if (!title || !content)
    return NextResponse.json(
      { ok: false, message: "제목과 내용은 필수입니다." },
      { status: 400 },
    )

  let imageRecord: ReturnType<typeof toImageRecordFromUrl> | null = null
  if (thumbnailUrl) {
    imageRecord = toImageRecordFromUrl(thumbnailUrl)
  } else if (thumbnail instanceof File) {
    try {
      imageRecord = await uploadThumbnailFile(thumbnail)
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          message:
            error instanceof Error
              ? error.message
              : "썸네일 업로드에 실패했습니다.",
        },
        { status: 400 },
      )
    }
  } else {
    return NextResponse.json(
      { ok: false, message: "썸네일은 필수입니다." },
      { status: 400 },
    )
  }

  const created = await prisma.post.create({
    data: {
      category: "GALLERY",
      title,
      slug: createTimestampSlug(title, "gallery"),
      content,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      authorId: author.id,
      galleryImages: { create: imageRecord },
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, id: created.id })
}
