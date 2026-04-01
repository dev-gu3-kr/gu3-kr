import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
import {
  type ApiResponseDto,
  createIntroPostSchema,
  type IntroPostDetailDto,
} from "@/features/intro-posts/isomorphic"
import { introPostsService } from "@/features/intro-posts/server"
import { assertAdminSession } from "@/lib/admin/session"
import { getMinioS3Client } from "@/lib/admin/storage"

const SECTION = "community" as const

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
  const item = await introPostsService.getIntroPostById(SECTION, id)

  if (!item) {
    return NextResponse.json(
      { ok: false, message: "소개 항목을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const responseItem: IntroPostDetailDto = {
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    content: item.content,
    isPublished: item.isPublished,
    createdAt: item.createdAt.toISOString(),
  }

  const response: ApiResponseDto<{ item: IntroPostDetailDto }> = {
    ok: true,
    item: responseItem,
  }

  return NextResponse.json(response)
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

  const json = await request.json().catch(() => null)
  const parsed = createIntroPostSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  const { id } = await context.params
  const detail = await introPostsService.getIntroPostById(SECTION, id)

  if (!detail) {
    return NextResponse.json(
      { ok: false, message: "소개 항목을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const replaceImage =
    parsed.data.imageUrl !== detail.imageUrl
      ? toImageRecordFromUrl(parsed.data.imageUrl)
      : undefined

  const updated = await introPostsService.updateIntroPost({
    section: SECTION,
    id,
    title: parsed.data.title,
    content: parsed.data.content,
    isPublished: parsed.data.isPublished,
    ...(replaceImage ? { replaceImage } : {}),
  })

  if (!updated) {
    return NextResponse.json(
      { ok: false, message: "소개 항목을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  if (updated.oldImageUrl) {
    const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET

    if (bucket) {
      const client = getMinioS3Client()
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: resolveObjectKey(updated.oldImageUrl),
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
  const removed = await introPostsService.removeIntroPostById(SECTION, id)

  if (!removed) {
    return NextResponse.json(
      { ok: false, message: "소개 항목을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET

  if (bucket && removed.imageUrls.length > 0) {
    const client = getMinioS3Client()
    await Promise.all(
      removed.imageUrls.map((url) =>
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
