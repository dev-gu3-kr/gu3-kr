import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import type { PostAssetRole } from "@prisma/client"
import { getMinioS3Client } from "@/lib/admin/storage"
import {
  attachFileToPost,
  createPendingFileAsset,
  deleteUnusedFileAssetById,
  findCleanupCandidates,
  findFileAssetIdsByPostId,
  findFileAssetsByUrls,
  findImageUsagesByPostId,
  findPostReferencingFile,
  findUnusedFileAssetById,
  findUnusedFileAssetByReference,
  reconcilePostAssetAssignments,
} from "./content-images.query"

const CONTENT_URL_PATTERN = /https?:\/\/[^\s<>"'()[\]]+/g

function extractContentUrls(content: string) {
  return (content.match(CONTENT_URL_PATTERN) ?? []).map((url) =>
    url.replace(/[\])}>.,;]+$/g, ""),
  )
}

async function deleteMinioObject(bucket: string, objectKey: string) {
  const client = getMinioS3Client()
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    }),
  )
}

// 업로드 API가 저장한 객체를 사용처가 없는 PENDING 자산으로 기록한다.
export async function registerPendingUpload(input: {
  objectKey: string
  url: string
  originalName: string
  mimeType: string
  sizeBytes: number
  uploadedById: string
}) {
  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!bucket) throw new Error("이미지 버킷 설정이 비어 있습니다.")

  return createPendingFileAsset({ ...input, bucket })
}

// 본문 URL은 CONTENT, 명시 URL은 COVER 역할로 게시물 사용처를 멱등하게 맞춘다.
export async function reconcilePostImages(input: {
  postId: string
  content: string
  explicitUrls?: string[]
  uploadedById: string
}) {
  try {
    const contentUrls = new Set(extractContentUrls(input.content))
    const coverUrls = new Set(
      (input.explicitUrls ?? []).map((url) => url.trim()).filter(Boolean),
    )
    const referencedUrls = new Set([...contentUrls, ...coverUrls])
    const [currentUsages, referencedAssets] = await Promise.all([
      findImageUsagesByPostId(input.postId),
      findFileAssetsByUrls([...referencedUrls]),
    ])
    const assetByUrl = new Map(
      referencedAssets.map((asset) => [asset.url, asset]),
    )
    const desired = new Map<string, { assetId: string; role: PostAssetRole }>()

    for (const url of contentUrls) {
      const asset = assetByUrl.get(url)
      if (asset) {
        desired.set(`${asset.id}:CONTENT`, {
          assetId: asset.id,
          role: "CONTENT",
        })
      }
    }

    for (const url of coverUrls) {
      const asset = assetByUrl.get(url)
      if (asset) {
        desired.set(`${asset.id}:COVER`, {
          assetId: asset.id,
          role: "COVER",
        })
      }
    }

    const currentKeys = new Set(
      currentUsages.map((usage) => `${usage.assetId}:${usage.role}`),
    )
    const attach = [...desired.entries()]
      .filter(([key]) => !currentKeys.has(key))
      .map(([, usage]) => usage)
    const detachedUsages = currentUsages.filter(
      (usage) => !desired.has(`${usage.assetId}:${usage.role}`),
    )

    await reconcilePostAssetAssignments({
      postId: input.postId,
      attach,
      detachIds: detachedUsages.map((usage) => usage.id),
    })

    const cleanupResults = await Promise.allSettled(
      [...new Set(detachedUsages.map((usage) => usage.assetId))].map((id) =>
        deletePendingImageById(id),
      ),
    )

    return {
      ok: true as const,
      attached: attach.length,
      detached: detachedUsages.length,
      cleanupFailures: cleanupResults.filter(
        (result) => result.status === "rejected",
      ).length,
    }
  } catch (error) {
    // 게시물 저장은 이미 완료됐을 수 있으므로 야간 정리가 실제 본문 참조를 재확인하게 둔다.
    console.error("[content-images] 게시물 파일 연결에 실패했습니다.", error)
    return { ok: false as const, attached: 0, detached: 0, cleanupFailures: 0 }
  }
}

// 게시물 삭제 전에 연결된 자산 ID를 보관해 삭제 후 물리 객체 정리를 재시도할 수 있게 한다.
export async function preparePostDeletion(postId: string) {
  try {
    return await findFileAssetIdsByPostId(postId)
  } catch (error) {
    console.error(
      "[content-images] 게시물 삭제 전 파일 조회에 실패했습니다.",
      error,
    )
    return []
  }
}

// 게시물 삭제로 사용처가 사라진 객체를 제거하고 실패 항목은 미사용 자산으로 보존한다.
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

// 사용처를 재확인한 뒤 MinIO 객체와 물리 자산 레코드를 같은 순서로 제거한다.
export async function deletePendingImageById(id: string) {
  const asset = await findUnusedFileAssetById(id)
  if (!asset) return false

  const referencedPost = await findPostReferencingFile(asset.url)
  if (referencedPost) {
    await attachFileToPost(asset.id, referencedPost.id)
    return false
  }

  await deleteMinioObject(asset.bucket, asset.objectKey)
  await deleteUnusedFileAssetById(asset.id)
  return true
}

// 업로드 취소 요청은 게시글 사용처가 없는 파일만 물리 객체와 DB에서 제거한다.
export async function deleteUnusedImageByReference(input: {
  url?: string
  objectKey?: string
}) {
  const asset = await findUnusedFileAssetByReference(input)
  if (!asset) return false

  return deletePendingImageById(asset.id)
}

// 유예 시간이 지난 미사용 자산을 실제 게시물 참조 여부까지 확인해 복구하거나 삭제한다.
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
      const referencedPost = await findPostReferencingFile(asset.url)

      if (referencedPost) {
        if (!input.dryRun) {
          await attachFileToPost(asset.id, referencedPost.id)
        }
        recovered += 1
        continue
      }

      if (!input.dryRun) {
        await deleteMinioObject(asset.bucket, asset.objectKey)
        await deleteUnusedFileAssetById(asset.id)
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
