import { randomUUID } from "node:crypto"
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { contentImageService } from "@/features/content-images/server"
import { assertAdminSession } from "@/lib/admin/session"
import {
  createMinioPublicObjectUrl,
  getMinioS3Client,
  resolveMinioObjectKey,
} from "@/lib/admin/storage"
import {
  CONTENT_IMAGE_UPLOAD_MAX_BYTES,
  convertImageToWebp,
} from "@/lib/admin/upload"

// 소개 카드 대표 이미지를 MinIO에 업로드한다.
export async function POST(request: Request) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, message: "파일이 필요합니다." },
      { status: 400 },
    )
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, message: "이미지 파일만 업로드할 수 있습니다." },
      { status: 400 },
    )
  }

  if (file.size > CONTENT_IMAGE_UPLOAD_MAX_BYTES) {
    return NextResponse.json(
      { ok: false, message: "파일 용량은 20MB 이하여야 합니다." },
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

  let converted: Awaited<ReturnType<typeof convertImageToWebp>>
  try {
    converted = await convertImageToWebp(file)
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "이미지 변환에 실패했습니다.",
      },
      { status: 400 },
    )
  }

  const key = `data/intro-posts/${Date.now()}-${randomUUID()}.${converted.extension}`
  const url = createMinioPublicObjectUrl(bucket, key)

  const client = getMinioS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: converted.body,
      ContentType: converted.contentType,
    }),
  )

  try {
    await contentImageService.registerPendingUpload({
      objectKey: key,
      url,
      originalName: file.name,
      mimeType: converted.contentType,
      sizeBytes: converted.body.byteLength,
      uploadedById: author.id,
    })
  } catch (error) {
    // 추적 레코드가 없으면 자동 정리가 불가능하므로 방금 저장한 객체를 되돌린다.
    await client
      .send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
      .catch(() => undefined)
    console.error("[content-images] 소개 이미지 추적에 실패했습니다.", error)
    return NextResponse.json(
      { ok: false, message: "이미지 업로드 상태 기록에 실패했습니다." },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, url, key })
}

export async function DELETE(request: Request) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET

  if (!bucket) {
    return NextResponse.json(
      { ok: false, message: "버킷 설정이 비어 있습니다." },
      { status: 500 },
    )
  }

  const body = (await request.json().catch(() => null)) as {
    key?: string
    url?: string
  } | null

  const objectKey = resolveMinioObjectKey({
    key: body?.key,
    url: body?.url,
    bucket,
  })

  if (!objectKey) {
    return NextResponse.json(
      { ok: false, message: "삭제할 이미지 정보를 확인할 수 없습니다." },
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

  await contentImageService.forgetTrackedImage({
    url: body?.url,
    objectKey,
  })

  return NextResponse.json({ ok: true })
}
