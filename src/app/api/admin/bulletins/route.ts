import { randomUUID } from "node:crypto"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { bulletinService } from "@/features/bulletins/server"
import { assertAdminSession } from "@/lib/admin/session"
import { getMinioS3Client } from "@/lib/admin/storage"

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

  const page = await bulletinService.getBulletinPage({
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
  const file = formData.get("file")

  if (!title) {
    return NextResponse.json(
      { ok: false, message: "제목은 필수입니다." },
      { status: 400 },
    )
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, message: "주보파일은 필수입니다." },
      { status: 400 },
    )
  }

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

  const created = await bulletinService.createBulletin({
    title,
    content,
    isPublished,
    authorId: author.id,
    attachment: {
      fileName: key.split("/").pop() || file.name,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      url: fileUrl,
    },
  })

  return NextResponse.json({ ok: true, id: created.id })
}
