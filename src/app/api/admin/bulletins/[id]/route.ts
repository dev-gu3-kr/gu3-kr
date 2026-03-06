// 관리자 API 라우트: 요청 검증, 권한 확인, 서비스 호출을 통해 CRUD 계약을 제공한다.
import { randomUUID } from "node:crypto"
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { assertAdminSession } from "@/lib/admin/session"
import { createTimestampSlug } from "@/lib/admin/slug"
import { getMinioS3Client } from "@/lib/admin/storage"
import { prisma } from "@/lib/prisma"

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.

// 관리자 세션 유효성을 검사한다.

// 업로드/삭제에 사용할 S3(MinIO) 클라이언트를 생성한다.

function resolveObjectKey(raw: string) {
  const endpoint = (process.env.MINIO_ENDPOINT || "").replace(/\/$/, "")
  if (endpoint && raw.startsWith(endpoint)) {
    const [, , ...rest] = raw.slice(endpoint.length + 1).split("/")
    return rest.join("/")
  }
  return raw
}

// 목록/상세 조회 요청을 처리한다.
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const item = await prisma.post.findFirst({
    where: { id, category: "BULLETIN" },
    select: {
      id: true,
      title: true,
      content: true,
      isPublished: true,
      createdAt: true,
      attachments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, originalName: true, url: true },
      },
    },
  })

  if (!item) {
    return NextResponse.json(
      { ok: false, message: "본당주보를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true, item })
}

// 수정 요청을 처리한다.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const target = await prisma.post.findFirst({
    where: { id, category: "BULLETIN" },
    select: {
      id: true,
      attachments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, url: true },
      },
    },
  })

  if (!target) {
    return NextResponse.json(
      { ok: false, message: "본당주보를 찾을 수 없습니다." },
      { status: 404 },
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
        { ok: false, message: "허용되지 않는 파일 형식입니다." },
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

    newAttachment = {
      fileName: key.split("/").pop() || file.name,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      url: fileUrl,
    }

    const oldAttachment = target.attachments[0]
    if (oldAttachment) {
      await prisma.attachment.delete({ where: { id: oldAttachment.id } })
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: resolveObjectKey(oldAttachment.url),
        }),
      )
    }
  }

  await prisma.post.update({
    where: { id },
    data: {
      title,
      slug: createTimestampSlug(title, "bulletin"),
      content,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      ...(newAttachment
        ? {
            attachments: {
              create: newAttachment,
            },
          }
        : {}),
    },
  })

  return NextResponse.json({ ok: true })
}

// 삭제 요청을 처리한다.
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const target = await prisma.post.findFirst({
    where: { id, category: "BULLETIN" },
    select: { id: true, attachments: { select: { id: true, url: true } } },
  })

  if (!target) {
    return NextResponse.json(
      { ok: false, message: "본당주보를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (bucket && target.attachments.length > 0) {
    const client = getMinioS3Client()
    await Promise.all(
      target.attachments.map((attachment) =>
        client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: resolveObjectKey(attachment.url),
          }),
        ),
      ),
    )
  }

  await prisma.post.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
