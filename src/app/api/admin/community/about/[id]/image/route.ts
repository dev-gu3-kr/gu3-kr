import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"
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
  const removed = await introPostsService.removeIntroPostImage(SECTION, id)

  if (!removed) {
    return NextResponse.json(
      { ok: false, message: "소개 항목을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  if (removed.oldImageUrl) {
    const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET

    if (bucket) {
      const client = getMinioS3Client()
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: resolveObjectKey(removed.oldImageUrl),
        }),
      )
    }
  }

  return NextResponse.json({ ok: true })
}
