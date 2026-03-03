import { randomUUID } from "node:crypto"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"

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

export async function POST(request: Request) {
  const author = await assertAdmin(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, message: "파일이 필요합니다." },
      { status: 400 },
    )
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, message: "이미지 파일만 업로드할 수 있습니다." },
      { status: 400 },
    )
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, message: "파일 용량은 5MB 이하여야 합니다." },
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

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin"
  const key = `cathedral/clergy/${Date.now()}-${randomUUID()}.${ext}`
  const body = Buffer.from(await file.arrayBuffer())

  const client = getS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type,
    }),
  )

  const base = (process.env.MINIO_PUBLIC_BASE_URL || "").replace(/\/$/, "")
  const url = base
    ? `${base}/${bucket}/${key}`
    : `${process.env.MINIO_ENDPOINT}/${bucket}/${key}`

  return NextResponse.json({ ok: true, url, key })
}
