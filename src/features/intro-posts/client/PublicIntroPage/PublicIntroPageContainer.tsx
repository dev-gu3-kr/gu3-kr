"use client"

import type { IntroPostSectionKey } from "@/features/intro-posts/isomorphic"
import { usePublicIntroPostListQuery } from "@/features/intro-posts/isomorphic"
import { PublicIntroPageView } from "./PublicIntroPageView"

type PublicIntroPageContainerProps = {
  section: IntroPostSectionKey
}

export function PublicIntroPageContainer({
  section,
}: PublicIntroPageContainerProps) {
  const { data, isLoading, isError } = usePublicIntroPostListQuery(section)

  return (
    <PublicIntroPageView
      section={section}
      items={data ?? []}
      isLoading={isLoading}
      isError={isError}
    />
  )
}
