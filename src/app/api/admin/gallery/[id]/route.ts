import { randomUUID } from "node:crypto"
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { contentImageService } from "@/features/content-images/server"
import { galleryService } from "@/features/gallery/server"
import { assertAdminSession } from "@/lib/admin/session"
import {
  createMinioPublicObjectUrl,
  extractMinioObjectKey,
  getMinioS3Client,
} from "@/lib/admin/storage"
import {
  CONTENT_IMAGE_UPLOAD_MAX_BYTES,
  convertImageToWebp,
} from "@/lib/admin/upload"

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
  if (thumbnail.size > CONTENT_IMAGE_UPLOAD_MAX_BYTES) {
    throw new Error("파일 용량은 20MB 이하여야 합니다.")
  }

  const ext = thumbnail.name.includes(".")
    ? thumbnail.name.split(".").pop()?.toLowerCase()
    : ""
  const allowed = new Set(["jpg", "jpeg", "png", "webp", "gif"])
  if (!ext || !allowed.has(ext)) {
    throw new Error("허용되지 않는 이미지 형식입니다.")
  }

  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!bucket) throw new Error("버킷 설정이 비어 있습니다.")

  const converted = await convertImageToWebp(thumbnail)
  const key = `data/gallery/${Date.now()}-${randomUUID()}.${converted.extension}`
  const fileUrl = createMinioPublicObjectUrl(bucket, key)
  const client = getMinioS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: converted.body,
      ContentType: converted.contentType,
    }),
  )

  return {
    fileName: key.split("/").pop() || thumbnail.name,
    originalName: thumbnail.name,
    mimeType: converted.contentType,
    sizeBytes: converted.body.byteLength,
    url: fileUrl,
    isCover: true,
    sortOrder: 0,
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const item = await galleryService.getGalleryById(id)

  if (!item) {
    return NextResponse.json(
      { ok: false, message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true, item })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params

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

  const detail = await galleryService.getGalleryById(id)
  if (!detail) {
    return NextResponse.json(
      { ok: false, message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  let replaceImage: null | {
    fileName: string
    originalName: string
    mimeType: string
    sizeBytes: number
    url: string
    isCover: boolean
    sortOrder: number
  } = null

  if (thumbnailUrl && thumbnailUrl !== detail.galleryImages[0]?.url) {
    replaceImage = toImageRecordFromUrl(thumbnailUrl)
  } else if (thumbnail instanceof File && thumbnail.size > 0) {
    try {
      replaceImage = await uploadThumbnailFile(thumbnail)
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
  }

  const updated = await galleryService.updateGallery({
    id,
    title,
    content,
    isPublished,
    ...(replaceImage ? { replaceImage } : {}),
  })

  if (!updated) {
    return NextResponse.json(
      { ok: false, message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  await contentImageService.reconcilePostImages({
    postId: id,
    content,
    explicitUrls: [replaceImage?.url ?? detail.galleryImages[0]?.url ?? ""],
    uploadedById: author.id,
  })

  if (updated.oldImageUrl) {
    const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
    if (bucket) {
      const client = getMinioS3Client()
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: extractMinioObjectKey(updated.oldImageUrl, bucket),
        }),
      )
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const contentImageIds = await contentImageService.preparePostDeletion(id)
  const removed = await galleryService.removeGallery(id)

  if (!removed) {
    return NextResponse.json(
      { ok: false, message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  await contentImageService.cleanupPreparedDeletion(contentImageIds)

  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (bucket && removed.imageUrls.length > 0) {
    const client = getMinioS3Client()
    await Promise.all(
      removed.imageUrls.map((url: string) =>
        client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: extractMinioObjectKey(url, bucket),
          }),
        ),
      ),
    )
  }

  return NextResponse.json({ ok: true })
}
