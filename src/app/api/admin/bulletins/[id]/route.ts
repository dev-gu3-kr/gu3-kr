import { randomUUID } from "node:crypto"
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { bulletinService } from "@/features/bulletins/server"
import { assertAdminSession } from "@/lib/admin/session"
import { getMinioS3Client } from "@/lib/admin/storage"

function resolveObjectKey(raw: string) {
  const endpoint = (process.env.MINIO_ENDPOINT || "").replace(/\/$/, "")
  if (endpoint && raw.startsWith(endpoint)) {
    const [, , ...rest] = raw.slice(endpoint.length + 1).split("/")
    return rest.join("/")
  }
  return raw
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

  if (!title) {
    return NextResponse.json(
      { ok: false, message: "제목은 필수입니다." },
      { status: 400 },
    )
  }

  let newAttachment:
    | {
        fileName: string
        originalName: string
        mimeType: string
        sizeBytes: number
        url: string
      }
    | undefined

  if (file instanceof File && file.size > 0) {
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, message: "파일 용량은 20MB 이하여야 합니다." },
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

    newAttachment = {
      fileName: key.split("/").pop() || file.name,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      url: fileUrl,
    }
  }

  const updated = await bulletinService.updateBulletin({
    id,
    title,
    content,
    isPublished,
    ...(newAttachment ? { newAttachment } : {}),
  })

  if (!updated) {
    return NextResponse.json(
      { ok: false, message: "본당주보를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  if (updated.oldAttachmentUrl) {
    const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
    if (bucket) {
      const client = getMinioS3Client()
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: resolveObjectKey(updated.oldAttachmentUrl),
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
  const removed = await bulletinService.removeBulletin(id)

  if (!removed) {
    return NextResponse.json(
      { ok: false, message: "본당주보를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (bucket && removed.attachmentUrls.length > 0) {
    const client = getMinioS3Client()
    await Promise.all(
      removed.attachmentUrls.map((url) =>
        client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: resolveObjectKey(url),
          }),
        ),
      ),
    )
  }

  return NextResponse.json({ ok: true })
}
