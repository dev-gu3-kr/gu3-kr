import { NextResponse } from "next/server"

import type {
  ApiResponseDto,
  GalleryDetailDto,
  GalleryNavigationDto,
} from "@/features/gallery/isomorphic"
import { galleryService } from "@/features/gallery/server"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params

  const detail =
    await galleryService.getPublishedGalleryDetailWithNavigation(id)

  if (!detail) {
    return NextResponse.json(
      { ok: false, message: "갤러리를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const item: GalleryDetailDto = {
    id: detail.item.id,
    title: detail.item.title,
    content: detail.item.content,
    isPublished: detail.item.isPublished,
    createdAt: detail.item.createdAt.toISOString(),
    galleryImages: detail.item.galleryImages,
    youtubeUrl: detail.item.youtubeUrl,
    hasYoutube: detail.item.hasYoutube,
  }

  const navigation: GalleryNavigationDto = detail.navigation

  const response: ApiResponseDto<{
    item: GalleryDetailDto
    navigation: GalleryNavigationDto
  }> = {
    ok: true,
    item,
    navigation,
  }

  return NextResponse.json(response)
}
