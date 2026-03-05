// 신부/수녀 프로필 이미지 MinIO 업로드/삭제 API
import { randomUUID } from "node:crypto"
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { assertAdminSession } from "@/lib/admin/session"
import { getMinioS3Client } from "@/lib/admin/storage"

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.

// 세션 쿠키를 기준으로 관리자 로그인 여부를 검증한다.

// key 또는 URL에서 실제 S3 object key를 안전하게 복원한다.
function resolveObjectKey(params: {
  key?: string
  url?: string
  bucket: string
}) {
  const { key, url, bucket } = params

  if (key?.trim()) return key.trim()
  if (!url?.trim()) return null

  const normalizedUrl = url.trim()
  const marker = `/${bucket}/`
  const markerIndex = normalizedUrl.indexOf(marker)
  if (markerIndex < 0) return null

  return normalizedUrl.slice(markerIndex + marker.length)
}

// MinIO 환경변수를 검증한 뒤 S3Client를 생성한다.

// 이미지 파일 검증 후 MinIO에 업로드하고 접근 URL을 반환한다.
export async function POST(request: Request) {
  const author = await assertAdminSession(request)
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

  const client = getMinioS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type,
    }),
  )

  const endpoint = (process.env.MINIO_ENDPOINT || "").replace(/\/$/, "")
  const url = `${endpoint}/${bucket}/${key}`

  return NextResponse.json({ ok: true, url, key })
}

// 요청 key/url 기준으로 MinIO 이미지를 물리 삭제한다.
export async function DELETE(request: Request) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!bucket) {
    return NextResponse.json(
      { ok: false, message: "버킷 설정이 비어 있습니다." },
      { status: 500 },
    )
  }

  const body = (await request.json().catch(() => null)) as {
    key?: string
    url?: string
  } | null

  const objectKey = resolveObjectKey({
    key: body?.key,
    url: body?.url,
    bucket,
  })

  if (!objectKey) {
    return NextResponse.json(
      { ok: false, message: "삭제할 이미지 정보를 확인할 수 없습니다." },
      { status: 400 },
    )
  }

  const client = getMinioS3Client()
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    }),
  )

  return NextResponse.json({ ok: true })
}
