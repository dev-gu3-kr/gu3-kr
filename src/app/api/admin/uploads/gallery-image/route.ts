// 관리자 API 라우트: 요청 검증, 권한 확인, 서비스 호출을 통해 CRUD 계약을 제공한다.
import { randomUUID } from "node:crypto"
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import { contentImageService } from "@/features/content-images/server"
import { assertAdminSession } from "@/lib/admin/session"
import {
  createMinioPublicObjectUrl,
  getMinioS3Client,
} from "@/lib/admin/storage"
import {
  CONTENT_IMAGE_UPLOAD_MAX_BYTES,
  convertImageToWebp,
} from "@/lib/admin/upload"

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.

// 관리자 세션 유효성을 검사한다.

// 업로드/삭제에 사용할 S3(MinIO) 클라이언트를 생성한다.

// 생성 요청을 처리한다.
// 이미지 업로드를 받아 공용 버킷에 저장하고 URL을 반환한다.
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

  if (file.size > CONTENT_IMAGE_UPLOAD_MAX_BYTES) {
    return NextResponse.json(
      { ok: false, message: "파일 용량은 20MB 이하여야 합니다." },
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

  const key = `data/gallery/content/${Date.now()}-${randomUUID()}.${converted.extension}`
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
    console.error("[content-images] 갤러리 이미지 추적에 실패했습니다.", error)
    return NextResponse.json(
      { ok: false, message: "이미지 업로드 상태 기록에 실패했습니다." },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, url, key })
}
