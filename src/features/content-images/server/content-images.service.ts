import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { getMinioS3Client, resolveMinioObjectKey } from "@/lib/admin/storage"
import {
  attachContentImageToPost,
  createPendingContentImage,
  deleteContentImageTracking,
  deleteDetachedContentImageById,
  findCleanupCandidates,
  findContentImagesByPostId,
  findContentImagesByUrls,
  findDetachedContentImageById,
  findPostReferencingContentImage,
  findPostsForContentImageBackfill,
  reconcileContentImageAssignments,
  upsertAttachedContentImage,
} from "./content-images.query"

const CONTENT_URL_PATTERN = /https?:\/\/[^\s<>"'()[\]]+/g

type ExistingImageMetadata = {
  originalName: string
  mimeType: string
  sizeBytes: number
}

function extractContentUrls(content: string) {
  return (content.match(CONTENT_URL_PATTERN) ?? []).map((url) =>
    url.replace(/[\])}>.,;]+$/g, ""),
  )
}

function inferImageMimeType(objectKey: string) {
  const extension = objectKey.split(".").pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    avif: "image/avif",
    gif: "image/gif",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
    webp: "image/webp",
  }

  return (extension && mimeTypes[extension]) || "application/octet-stream"
}

function inferOriginalName(objectKey: string) {
  const encodedName = objectKey.split("/").pop() || "legacy-image"

  try {
    return decodeURIComponent(encodedName)
  } catch {
    return encodedName
  }
}

async function readObjectMetadata(objectKey: string, bucket: string) {
  const client = getMinioS3Client()
  const metadata = await client.send(
    new HeadObjectCommand({ Bucket: bucket, Key: objectKey }),
  )

  return {
    originalName: inferOriginalName(objectKey),
    mimeType: metadata.ContentType || inferImageMimeType(objectKey),
    sizeBytes: metadata.ContentLength ?? 0,
  }
}

async function deleteMinioObject(objectKey: string) {
  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!bucket) throw new Error("이미지 버킷 설정이 비어 있습니다.")

  const client = getMinioS3Client()
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    }),
  )
}

// 업로드 API가 저장한 객체를 게시물 저장 전 추적 가능한 상태로 기록한다.
export async function registerPendingUpload(input: {
  objectKey: string
  url: string
  originalName: string
  mimeType: string
  sizeBytes: number
  uploadedById: string
}) {
  return createPendingContentImage(input)
}

// 추적 기능 도입 전에 저장된 본문·대표 이미지를 ATTACHED 자산으로 멱등 복원한다.
export async function backfillExistingImages(input: {
  cursor?: string
  take: number
  dryRun: boolean
}) {
  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!bucket) throw new Error("이미지 버킷 설정이 비어 있습니다.")

  const posts = await findPostsForContentImageBackfill({
    cursor: input.cursor,
    take: input.take,
  })
  let discovered = 0
  let created = 0
  let attached = 0
  let unchanged = 0
  let metadataFallbacks = 0
  let failed = 0

  for (const post of posts) {
    const storedMetadata = new Map<string, ExistingImageMetadata>(
      post.postImages.map((image) => [
        image.url,
        {
          originalName: image.originalName,
          mimeType: image.mimeType,
          sizeBytes: image.sizeBytes,
        },
      ]),
    )
    const referencedUrls = new Set([
      ...extractContentUrls(post.content),
      ...storedMetadata.keys(),
    ])

    for (const url of referencedUrls) {
      const objectKey = resolveMinioObjectKey({ url, bucket })
      if (!objectKey) continue

      discovered += 1
      if (input.dryRun) continue

      try {
        let metadata: ExistingImageMetadata | undefined =
          storedMetadata.get(url)

        if (!metadata) {
          try {
            metadata = await readObjectMetadata(objectKey, bucket)
          } catch (error) {
            metadataFallbacks += 1
            console.warn(
              `[content-images] 기존 객체 메타데이터 조회에 실패해 기본값을 사용합니다: ${objectKey}`,
              error,
            )
            metadata = {
              originalName: inferOriginalName(objectKey),
              mimeType: inferImageMimeType(objectKey),
              sizeBytes: 0,
            }
          }
        }

        const result = await upsertAttachedContentImage({
          objectKey,
          url,
          originalName: metadata.originalName,
          mimeType: metadata.mimeType,
          sizeBytes: metadata.sizeBytes,
          uploadedById: post.authorId,
          postId: post.id,
          createdAt: post.createdAt,
        })

        if (result.created) created += 1
        else if (result.attached) attached += 1
        else unchanged += 1
      } catch (error) {
        failed += 1
        console.error(
          `[content-images] 기존 이미지 백필에 실패했습니다: ${url}`,
          error,
        )
      }
    }
  }

  return {
    scannedPosts: posts.length,
    discovered,
    created,
    attached,
    unchanged,
    metadataFallbacks,
    failed,
    dryRun: input.dryRun,
    nextCursor: posts.length === input.take ? posts.at(-1)?.id || null : null,
  }
}

// 저장된 본문과 대표 이미지 URL을 기준으로 자산 연결 상태를 멱등하게 맞춘다.
export async function reconcilePostImages(input: {
  postId: string
  content: string
  explicitUrls?: string[]
  uploadedById: string
}) {
  try {
    const referencedUrls = new Set([
      ...extractContentUrls(input.content),
      ...(input.explicitUrls ?? []).map((url) => url.trim()).filter(Boolean),
    ])
    const [currentAssets, referencedAssets] = await Promise.all([
      findContentImagesByPostId(input.postId),
      findContentImagesByUrls([...referencedUrls]),
    ])

    const attachIds = referencedAssets
      .filter(
        (asset) =>
          asset.postId === input.postId ||
          (asset.postId === null && asset.uploadedById === input.uploadedById),
      )
      .map((asset) => asset.id)
    const detachIds = currentAssets
      .filter((asset) => !referencedUrls.has(asset.url))
      .map((asset) => asset.id)

    await reconcileContentImageAssignments({
      postId: input.postId,
      attachIds,
      detachIds,
    })

    const cleanupResults = await Promise.allSettled(
      detachIds.map((id) => deletePendingImageById(id)),
    )

    return {
      ok: true as const,
      attached: attachIds.length,
      detached: detachIds.length,
      cleanupFailures: cleanupResults.filter(
        (result) => result.status === "rejected",
      ).length,
    }
  } catch (error) {
    // 게시물 저장은 이미 완료됐을 수 있으므로 정리 작업이 실제 본문 참조를 재확인하게 둔다.
    console.error("[content-images] 게시물 이미지 연결에 실패했습니다.", error)
    return { ok: false as const, attached: 0, detached: 0, cleanupFailures: 0 }
  }
}

// 게시물 삭제 전에 연결 자산을 PENDING으로 분리해 물리 삭제 실패 시 야간 정리가 재처리하게 한다.
export async function preparePostDeletion(postId: string) {
  try {
    const assets = await findContentImagesByPostId(postId)
    const ids = assets.map((asset) => asset.id)

    await reconcileContentImageAssignments({
      postId,
      attachIds: [],
      detachIds: ids,
    })

    return ids
  } catch (error) {
    // 게시물 삭제 자체를 막지 않고 onDelete SetNull과 야간 정리 안전망으로 넘긴다.
    console.error(
      "[content-images] 게시물 삭제 전 이미지 분리에 실패했습니다.",
      error,
    )
    return []
  }
}

// 게시물 삭제가 끝난 뒤 분리된 객체를 제거하고 실패 항목은 PENDING 상태로 보존한다.
export async function cleanupPreparedDeletion(ids: string[]) {
  const results = await Promise.allSettled(
    ids.map((id) => deletePendingImageById(id)),
  )

  return {
    deleted: results.filter(
      (result) => result.status === "fulfilled" && result.value,
    ).length,
    failed: results.filter((result) => result.status === "rejected").length,
  }
}

// 미연결 상태를 재확인한 뒤 MinIO 객체와 DB 추적 레코드를 같은 순서로 제거한다.
export async function deletePendingImageById(id: string) {
  const asset = await findDetachedContentImageById(id)
  if (!asset) return false

  const referencedPost = await findPostReferencingContentImage(asset.url)
  if (referencedPost) {
    await attachContentImageToPost(asset.id, referencedPost.id)
    return false
  }

  await deleteMinioObject(asset.objectKey)
  await deleteDetachedContentImageById(asset.id)
  return true
}

// 직접 삭제 API가 이미 제거한 객체의 추적 레코드가 고아 상태로 남지 않게 한다.
export async function forgetTrackedImage(input: {
  url?: string
  objectKey?: string
}) {
  return deleteContentImageTracking(input)
}

// 유예 시간이 지난 자산을 실제 게시물 참조 여부까지 확인해 복구하거나 삭제한다.
export async function cleanupAbandonedImages(input: {
  olderThanHours: number
  take: number
  dryRun: boolean
}) {
  const before = new Date(Date.now() - input.olderThanHours * 60 * 60 * 1000)
  const candidates = await findCleanupCandidates({ before, take: input.take })
  let deleted = 0
  let recovered = 0
  let failed = 0

  for (const asset of candidates) {
    try {
      const referencedPost = await findPostReferencingContentImage(asset.url)

      if (referencedPost) {
        if (!input.dryRun) {
          await attachContentImageToPost(asset.id, referencedPost.id)
        }
        recovered += 1
        continue
      }

      if (!input.dryRun) {
        await deleteMinioObject(asset.objectKey)
        await deleteDetachedContentImageById(asset.id)
      }
      deleted += 1
    } catch (error) {
      failed += 1
      console.error(
        `[content-images] 자산 정리에 실패했습니다: ${asset.id}`,
        error,
      )
    }
  }

  return {
    scanned: candidates.length,
    deleted,
    recovered,
    failed,
    dryRun: input.dryRun,
    olderThanHours: input.olderThanHours,
  }
}
