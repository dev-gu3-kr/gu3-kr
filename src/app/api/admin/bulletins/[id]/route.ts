import { randomUUID } from "node:crypto"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { createBulletinSchema } from "@/features/bulletins/isomorphic"
import { bulletinService } from "@/features/bulletins/server"
import { contentImageService } from "@/features/content-images/server"
import { assertAdminSession } from "@/lib/admin/session"
import {
  createMinioPublicObjectUrl,
  getMinioS3Client,
} from "@/lib/admin/storage"
import { BULLETIN_UPLOAD_MAX_BYTES } from "@/lib/admin/upload"

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
  const item = await bulletinService.getBulletinById(id)

  if (!item) {
    return NextResponse.json(
      { ok: false, message: "본당주보를 찾을 수 없습니다." },
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
  const file = formData.get("file")

  const parsed = createBulletinSchema.safeParse({
    title,
    content,
    isPublished,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값을 확인해주세요." },
      { status: 400 },
    )
  }

  let newAttachment:
    | {
        bucket: string
        objectKey: string
        originalName: string
        mimeType: string
        sizeBytes: number
        url: string
        uploadedById: string
      }
    | undefined

  if (file instanceof File && file.size > 0) {
    if (file.size > BULLETIN_UPLOAD_MAX_BYTES) {
      return NextResponse.json(
        { ok: false, message: "파일 용량은 40MB 이하여야 합니다." },
        { status: 400 },
      )
    }

    const ext = file.name.includes(".")
      ? file.name.split(".").pop()?.toLowerCase()
      : ""
    const allowedExt = new Set(["pdf", "doc", "docx", "hwp", "hwpx"])

    if (!ext || !allowedExt.has(ext)) {
      return NextResponse.json(
        { ok: false, message: "허용되지 않은 파일 형식입니다." },
        { status: 400 },
      )
    }

    const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
    if (!bucket) {
      return NextResponse.json(
        { ok: false, message: "버킷 설정이 비어 있습니다." },
        { status: 500 },
      )
    }

    const key = `data/bulletins/${Date.now()}-${randomUUID()}.${ext}`
    const fileUrl = createMinioPublicObjectUrl(bucket, key)
    const client = getMinioS3Client()

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type || "application/octet-stream",
      }),
    )

    newAttachment = {
      bucket,
      objectKey: key,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      url: fileUrl,
      uploadedById: author.id,
    }
  }

  const updated = await bulletinService.updateBulletin({
    id,
    title: parsed.data.title,
    content: parsed.data.content,
    isPublished: parsed.data.isPublished ?? true,
    ...(newAttachment ? { newAttachment } : {}),
  })

  if (!updated) {
    return NextResponse.json(
      { ok: false, message: "본당주보를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  if (updated.oldAttachmentAssetId) {
    await contentImageService.deletePendingImageById(
      updated.oldAttachmentAssetId,
    )
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
  const fileAssetIds = await contentImageService.preparePostDeletion(id)
  const removed = await bulletinService.removeBulletin(id)

  if (!removed) {
    return NextResponse.json(
      { ok: false, message: "본당주보를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  await contentImageService.cleanupPreparedDeletion(fileAssetIds)

  return NextResponse.json({ ok: true })
}
