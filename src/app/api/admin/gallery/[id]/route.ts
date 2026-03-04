import { randomUUID } from "node:crypto"
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import { prisma } from "@/lib/prisma"

function getAuthorIdFromCookieHeader(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((token) => token.trim())
    .find((token) => token.startsWith(`${ADMIN_SESSION_COOKIE_KEY}=`))
    ?.split("=")[1]
}

async function assertAdmin(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)
  if (!authorId) return null
  return authService.getLoginCandidateById(authorId)
}

function getS3Client() {
  const endpoint = process.env.MINIO_ENDPOINT
  const accessKeyId = process.env.MINIO_ACCESS_KEY
  const secretAccessKey = process.env.MINIO_SECRET_KEY
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("MINIO 설정이 비어 있습니다.")
  }
  return new S3Client({
    endpoint,
    region: process.env.MINIO_REGION || "us-east-1",
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  })
}

function resolveObjectKey(raw: string) {
  const endpoint = (process.env.MINIO_ENDPOINT || "").replace(/\/$/, "")
  if (endpoint && raw.startsWith(endpoint)) {
    const [, , ...rest] = raw.slice(endpoint.length + 1).split("/")
    return rest.join("/")
  }
  return raw
}

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
  const client = getS3Client()
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
    imageRecord: {
      fileName: key.split("/").pop() || thumbnail.name,
      originalName: thumbnail.name,
      mimeType: thumbnail.type || "application/octet-stream",
      sizeBytes: thumbnail.size,
      url: fileUrl,
      isCover: true,
      sortOrder: 0,
    },
    bucket,
    client,
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdmin(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )

  const { id } = await context.params
  const item = await prisma.post.findFirst({
    where: { id, category: "GALLERY" },
    select: {
      id: true,
      title: true,
      content: true,
      isPublished: true,
      createdAt: true,
      galleryImages: {
        orderBy: [
          { isCover: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
        take: 1,
        select: { id: true, originalName: true, url: true },
      },
    },
  })

  if (!item)
    return NextResponse.json(
      { ok: false, message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    )

  return NextResponse.json({ ok: true, item })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdmin(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )

  const { id } = await context.params
  const target = await prisma.post.findFirst({
    where: { id, category: "GALLERY" },
    select: {
      id: true,
      galleryImages: {
        orderBy: [
          { isCover: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
        take: 1,
        select: { id: true, url: true },
      },
    },
  })
  if (!target)
    return NextResponse.json(
      { ok: false, message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
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

  let replaceImage: null | {
    fileName: string
    originalName: string
    mimeType: string
    sizeBytes: number
    url: string
    isCover: boolean
    sortOrder: number
  } = null

  if (thumbnailUrl && thumbnailUrl !== target.galleryImages[0]?.url) {
    replaceImage = toImageRecordFromUrl(thumbnailUrl)
  } else if (thumbnail instanceof File && thumbnail.size > 0) {
    try {
      const uploaded = await uploadThumbnailFile(thumbnail)
      replaceImage = uploaded.imageRecord
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
  }

  if (replaceImage) {
    const old = target.galleryImages[0]
    if (old) {
      await prisma.galleryImage.delete({ where: { id: old.id } })
      const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
      if (bucket) {
        const client = getS3Client()
        await client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: resolveObjectKey(old.url),
          }),
        )
      }
    }
  }

  await prisma.post.update({
    where: { id },
    data: {
      title,
      content,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      ...(replaceImage ? { galleryImages: { create: replaceImage } } : {}),
    },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdmin(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )

  const { id } = await context.params
  const target = await prisma.post.findFirst({
    where: { id, category: "GALLERY" },
    select: { id: true, galleryImages: { select: { url: true } } },
  })
  if (!target)
    return NextResponse.json(
      { ok: false, message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    )

  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (bucket && target.galleryImages.length > 0) {
    const client = getS3Client()
    await Promise.all(
      target.galleryImages.map((image) =>
        client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: resolveObjectKey(image.url),
          }),
        ),
      ),
    )
  }

  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
