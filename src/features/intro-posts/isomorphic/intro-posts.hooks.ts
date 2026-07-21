"use client"

import {
  type QueryClient,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import {
  type ApiResponseDto,
  getIntroPostSectionConfig,
  type IntroPostDetailDto,
  type IntroPostListDto,
  type IntroPostListItemDto,
  type IntroPostSectionKey,
} from "./intro-posts.types"

// 관리자 소개 게시글 캐시 key 모음
export const introPostQueryKeys = {
  all: ["admin", "intro-posts"] as const,
  list: (section: IntroPostSectionKey) =>
    [...introPostQueryKeys.all, "list", section] as const,
  detail: (section: IntroPostSectionKey, id: string) =>
    [...introPostQueryKeys.all, "detail", section, id] as const,
} as const

// 공개 소개 게시글 캐시 key 모음
export const publicIntroPostQueryKeys = {
  all: ["public", "intro-posts"] as const,
  list: (section: IntroPostSectionKey) =>
    [...publicIntroPostQueryKeys.all, "list", section] as const,
} as const

export async function syncIntroPostMutationCache(
  queryClient: QueryClient,
  options: {
    section: IntroPostSectionKey
    id?: string
    deleted?: boolean
  },
) {
  const { section, id, deleted = false } = options

  if (id && deleted) {
    queryClient.removeQueries({
      queryKey: introPostQueryKeys.detail(section, id),
    })
  }

  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: introPostQueryKeys.list(section),
    }),
    queryClient.invalidateQueries({
      queryKey: publicIntroPostQueryKeys.list(section),
    }),
    id && !deleted
      ? queryClient.invalidateQueries({
          queryKey: introPostQueryKeys.detail(section, id),
        })
      : Promise.resolve(),
  ])
}

type IntroPostListResponse = ApiResponseDto<IntroPostListDto>
type IntroPostDetailResponse = ApiResponseDto<{ item: IntroPostDetailDto }>

function getListErrorMessage(section: IntroPostSectionKey) {
  return `${getIntroPostSectionConfig(section).menuLabel} 목록을 불러오지 못했습니다.`
}

function getDetailErrorMessage(section: IntroPostSectionKey) {
  return `${getIntroPostSectionConfig(section).menuLabel} 상세를 불러오지 못했습니다.`
}

// markdown/plain text 내용을 카드 미리보기용 짧은 문자열로 정리한다.
export function getIntroPostContentPreview(content: string) {
  return content
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, "")
    .replace(/[>*_~|]/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function fetchIntroPostList(section: IntroPostSectionKey) {
  const config = getIntroPostSectionConfig(section)
  const response = await apiFetch.get(config.adminApiPath).send()

  if (!response.ok) {
    throw new Error(getListErrorMessage(section))
  }

  const json = (await response
    .json()
    .catch(() => null)) as IntroPostListResponse | null

  if (!json?.ok || !Array.isArray(json.items)) {
    throw new Error(getListErrorMessage(section))
  }

  return json.items
}

async function fetchIntroPostDetail(section: IntroPostSectionKey, id: string) {
  const config = getIntroPostSectionConfig(section)
  const response = await apiFetch.get(`${config.adminApiPath}/${id}`).send()

  if (!response.ok) {
    throw new Error(getDetailErrorMessage(section))
  }

  const json = (await response
    .json()
    .catch(() => null)) as IntroPostDetailResponse | null

  if (!json?.ok || !json.item) {
    throw new Error(getDetailErrorMessage(section))
  }

  return json.item
}

async function fetchPublicIntroPostList(section: IntroPostSectionKey) {
  const config = getIntroPostSectionConfig(section)
  const response = await apiFetch.get(config.publicApiPath).send()

  if (!response.ok) {
    throw new Error(`${config.publicPageTitle} 목록을 불러오지 못했습니다.`)
  }

  const json = (await response
    .json()
    .catch(() => null)) as IntroPostListResponse | null

  if (!json?.ok || !Array.isArray(json.items)) {
    throw new Error(`${config.publicPageTitle} 목록을 불러오지 못했습니다.`)
  }

  return json.items
}

// 관리자 목록 조회 훅
export function useIntroPostListQuery(section: IntroPostSectionKey) {
  return useQuery({
    queryKey: introPostQueryKeys.list(section),
    queryFn: () => fetchIntroPostList(section),
  })
}

// 관리자 상세 조회 훅
export function useIntroPostDetailQuery(
  section: IntroPostSectionKey,
  id: string,
) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: introPostQueryKeys.detail(section, id),
    enabled: id.length > 0,
    queryFn: () => fetchIntroPostDetail(section, id),
    initialData: () => {
      const items = queryClient.getQueryData<IntroPostListItemDto[]>(
        introPostQueryKeys.list(section),
      )
      const matched = items?.find((item) => item.id === id)

      if (!matched) return undefined

      return {
        id: matched.id,
        title: matched.title,
        imageUrl: matched.imageUrl,
        content: matched.content,
        sortOrder: matched.sortOrder,
        isPublished: matched.isPublished,
        createdAt: new Date(matched.createdAt).toISOString(),
      }
    },
    initialDataUpdatedAt: 0,
  })
}

// 공개 소개 페이지 목록 조회 훅
export function usePublicIntroPostListQuery(section: IntroPostSectionKey) {
  return useQuery({
    queryKey: publicIntroPostQueryKeys.list(section),
    queryFn: () => fetchPublicIntroPostList(section),
    staleTime: 10_000,
  })
}
