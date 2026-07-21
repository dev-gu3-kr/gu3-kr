import type { PostAssetRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"

type PendingFileAssetInput = {
  bucket: string
  objectKey: string
  url: string
  originalName: string
  mimeType: string
  sizeBytes: number
  uploadedById: string
}

// MinIO 업로드가 끝난 파일을 사용처가 없는 PENDING 자산으로 기록한다.
export function createPendingFileAsset(input: PendingFileAssetInput) {
  return prisma.fileAsset.create({ data: input })
}

// 저장 본문과 대표 이미지에서 발견한 URL에 해당하는 물리 자산을 조회한다.
export function findFileAssetsByUrls(urls: string[]) {
  if (urls.length === 0) return Promise.resolve([])

  return prisma.fileAsset.findMany({ where: { url: { in: urls } } })
}

// 게시글에 연결된 이미지 사용처와 물리 자산을 함께 조회한다.
export function findImageUsagesByPostId(postId: string) {
  return prisma.postAsset.findMany({
    where: { postId, role: { in: ["CONTENT", "COVER"] } },
    include: { asset: true },
  })
}

// 저장 결과에 맞춰 필요한 역할을 연결하고 빠진 역할만 제거한다.
export function reconcilePostAssetAssignments(input: {
  postId: string
  attach: Array<{ assetId: string; role: PostAssetRole }>
  detachIds: string[]
}) {
  return prisma.$transaction(async (transaction) => {
    if (input.attach.length > 0) {
      await transaction.postAsset.createMany({
        data: input.attach.map((usage) => ({
          postId: input.postId,
          assetId: usage.assetId,
          role: usage.role,
        })),
        skipDuplicates: true,
      })
    }

    if (input.detachIds.length > 0) {
      await transaction.postAsset.deleteMany({
        where: { id: { in: input.detachIds }, postId: input.postId },
      })
    }
  })
}

// 유예 시간이 지난 미사용 자산을 한 번의 정리 작업에서 처리할 범위만 조회한다.
export function findCleanupCandidates(input: { before: Date; take: number }) {
  return prisma.fileAsset.findMany({
    where: {
      postUsages: { none: {} },
      createdAt: { lte: input.before },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: input.take,
  })
}

// 저장 직후 연결이 실패했더라도 실제 게시물에서 URL을 사용 중이면 삭제하지 않는다.
export function findPostReferencingFile(url: string) {
  return prisma.post.findFirst({
    where: {
      OR: [
        { content: { contains: url } },
        { fileUsages: { some: { asset: { url } } } },
      ],
    },
    select: { id: true },
  })
}

// 정리 직전에 자산에 사용처가 생기지 않았는지 다시 확인한다.
export function findUnusedFileAssetById(id: string) {
  return prisma.fileAsset.findFirst({
    where: { id, postUsages: { none: {} } },
  })
}

// 실제 객체 삭제가 성공한 미사용 자산 레코드만 제거한다.
export function deleteUnusedFileAssetById(id: string) {
  return prisma.fileAsset.deleteMany({
    where: { id, postUsages: { none: {} } },
  })
}

// 명시적 이미지 삭제 API가 사용처 없는 물리 자산 레코드를 함께 제거한다.
export function findUnusedFileAssetByReference(input: {
  url?: string
  objectKey?: string
}) {
  const references = [
    ...(input.url ? [{ url: input.url }] : []),
    ...(input.objectKey ? [{ objectKey: input.objectKey }] : []),
  ]

  if (references.length === 0) return Promise.resolve(null)

  return prisma.fileAsset.findFirst({
    where: { OR: references, postUsages: { none: {} } },
  })
}

// 실제 본문 참조가 확인된 자산에 CONTENT 역할을 복구한다.
export function attachFileToPost(assetId: string, postId: string) {
  return prisma.postAsset.upsert({
    where: {
      postId_assetId_role: { postId, assetId, role: "CONTENT" },
    },
    create: { postId, assetId, role: "CONTENT" },
    update: {},
  })
}

// 게시물 삭제 전에 연결된 모든 물리 자산 ID를 중복 없이 수집한다.
export async function findFileAssetIdsByPostId(postId: string) {
  const usages = await prisma.postAsset.findMany({
    where: { postId },
    select: { assetId: true },
    distinct: ["assetId"],
  })

  return usages.map((usage) => usage.assetId)
}
