import { randomUUID } from "node:crypto"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { galleryService } from "@/features/gallery/server"
import { assertAdminSession } from "@/lib/admin/session"
import { getMinioS3Client } from "@/lib/admin/storage"

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
  if (!ext || !allowed.has(ext)) {
    throw new Error("허용되지 않는 이미지 형식입니다.")
  }

  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!bucket) throw new Error("버킷 설정이 비어 있습니다.")

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

export async function GET(request: Request) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const takeParam = Number(searchParams.get("take") || 20)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 100)
    : 20
  const cursor = searchParams.get("cursor") || undefined
  const query = (searchParams.get("query") || "").trim()
  const status = searchParams.get("status")

  const page = await galleryService.getGalleryPage({
    take,
    cursor,
    query,
    status,
  })

  return NextResponse.json({ ok: true, ...page })
}

export async function POST(request: Request) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const formData = await request.formData()
  const title = String(formData.get("title") || "").trim()
  const content = String(formData.get("content") || "").trim()
  const isPublished = String(formData.get("isPublished") || "true") === "true"
  const thumbnailUrl = String(formData.get("thumbnailUrl") || "").trim()
  const thumbnail = formData.get("thumbnail")

  if (!title || !content) {
    return NextResponse.json(
      { ok: false, message: "제목과 내용은 필수입니다." },
      { status: 400 },
    )
  }

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
              : "썸네일 업로드에 실패했습니다.",
        },
        { status: 400 },
      )
    }
  } else {
    return NextResponse.json(
      { ok: false, message: "썸네일은 필수입니다." },
      { status: 400 },
    )
  }

  const created = await galleryService.createGallery({
    title,
    content,
    isPublished,
    authorId: author.id,
    imageRecord,
  })

  return NextResponse.json({ ok: true, id: created.id })
}
