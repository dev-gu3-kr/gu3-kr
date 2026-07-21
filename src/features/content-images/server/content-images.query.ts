import { prisma } from "@/lib/prisma"

type PendingContentImageInput = {
  objectKey: string
  url: string
  originalName: string
  mimeType: string
  sizeBytes: number
  uploadedById: string
}

type AttachedContentImageInput = PendingContentImageInput & {
  postId: string
  createdAt: Date
}

// MinIO 업로드가 끝난 파일을 게시물 저장 전 PENDING 자산으로 추적한다.
export function createPendingContentImage(input: PendingContentImageInput) {
  return prisma.contentImageAsset.create({ data: input })
}

// 기존 게시물에서 복원한 자산은 URL 또는 객체 키가 이미 추적 중이면 그 레코드를 재사용한다.
export function upsertAttachedContentImage(input: AttachedContentImageInput) {
  return prisma.$transaction(async (transaction) => {
    const existing = await transaction.contentImageAsset.findFirst({
      where: {
        OR: [{ url: input.url }, { objectKey: input.objectKey }],
      },
    })

    if (existing) {
      if (existing.postId && existing.postId !== input.postId) {
        return { created: false, attached: false }
      }

      if (existing.postId === input.postId && existing.status === "ATTACHED") {
        return { created: false, attached: false }
      }

      await transaction.contentImageAsset.update({
        where: { id: existing.id },
        data: {
          url: input.url,
          status: "ATTACHED",
          postId: input.postId,
          attachedAt: new Date(),
        },
      })

      return { created: false, attached: true }
    }

    await transaction.contentImageAsset.create({
      data: {
        ...input,
        status: "ATTACHED",
        attachedAt: new Date(),
      },
    })

    return { created: true, attached: true }
  })
}

// 기존 게시물을 안정적인 ID 순서로 나눠 읽어 일회성 이미지 백필이 재시작 가능하게 한다.
export function findPostsForContentImageBackfill(input: {
  cursor?: string
  take: number
}) {
  return prisma.post.findMany({
    ...(input.cursor
      ? {
          cursor: { id: input.cursor },
          skip: 1,
        }
      : {}),
    orderBy: { id: "asc" },
    take: input.take,
    select: {
      id: true,
      authorId: true,
      content: true,
      createdAt: true,
      postImages: {
        select: {
          url: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
        },
      },
    },
  })
}

// 저장 본문과 대표 이미지에서 발견한 URL에 해당하는 추적 자산을 조회한다.
export function findContentImagesByUrls(urls: string[]) {
  if (urls.length === 0) return Promise.resolve([])

  return prisma.contentImageAsset.findMany({
    where: { url: { in: urls } },
  })
}

// 수정 전 게시물에 연결된 자산을 조회해 제거된 이미지와 유지 이미지를 구분한다.
export function findContentImagesByPostId(postId: string) {
  return prisma.contentImageAsset.findMany({ where: { postId } })
}

// 게시물 저장 결과에 맞춰 새 자산은 연결하고 빠진 자산은 다시 정리 대기 상태로 전환한다.
export function reconcileContentImageAssignments(input: {
  postId: string
  attachIds: string[]
  detachIds: string[]
}) {
  const now = new Date()

  return prisma.$transaction(async (transaction) => {
    if (input.attachIds.length > 0) {
      await transaction.contentImageAsset.updateMany({
        where: { id: { in: input.attachIds } },
        data: {
          status: "ATTACHED",
          postId: input.postId,
          attachedAt: now,
        },
      })
    }

    if (input.detachIds.length > 0) {
      await transaction.contentImageAsset.updateMany({
        where: { id: { in: input.detachIds }, postId: input.postId },
        data: {
          status: "PENDING",
          postId: null,
          attachedAt: null,
        },
      })
    }
  })
}

// 유예 시간이 지난 미연결 자산을 한 번의 정리 작업에서 처리할 범위만 조회한다.
export function findCleanupCandidates(input: { before: Date; take: number }) {
  return prisma.contentImageAsset.findMany({
    where: {
      postId: null,
      createdAt: { lte: input.before },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: input.take,
  })
}

// 저장 직후 상태 연결이 실패했더라도 실제 게시물에서 URL을 사용 중이면 삭제하지 않는다.
export function findPostReferencingContentImage(url: string) {
  return prisma.post.findFirst({
    where: {
      OR: [{ content: { contains: url } }, { postImages: { some: { url } } }],
    },
    select: { id: true },
  })
}

// 정리 직전에 자산이 여전히 미연결 상태인지 다시 확인해 동시 저장과 충돌을 줄인다.
export function findDetachedContentImageById(id: string) {
  return prisma.contentImageAsset.findFirst({
    where: { id, postId: null },
  })
}

// 실제 객체 삭제가 성공한 자산 레코드만 제거한다.
export function deleteDetachedContentImageById(id: string) {
  return prisma.contentImageAsset.deleteMany({
    where: { id, postId: null },
  })
}

// 명시적 이미지 삭제 API가 물리 파일과 추적 레코드를 함께 제거할 수 있게 한다.
export function deleteContentImageTracking(input: {
  url?: string
  objectKey?: string
}) {
  const references = [
    ...(input.url ? [{ url: input.url }] : []),
    ...(input.objectKey ? [{ objectKey: input.objectKey }] : []),
  ]

  if (references.length === 0) return Promise.resolve({ count: 0 })

  return prisma.contentImageAsset.deleteMany({ where: { OR: references } })
}

// 정리 전 실제 사용이 확인된 자산을 해당 게시물에 복구 연결한다.
export function attachContentImageToPost(id: string, postId: string) {
  return prisma.contentImageAsset.updateMany({
    where: { id },
    data: {
      status: "ATTACHED",
      postId,
      attachedAt: new Date(),
    },
  })
}
