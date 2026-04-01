"use client"

import type { IntroPostSectionKey } from "@/features/intro-posts/isomorphic"
import { useIntroPostListQuery } from "@/features/intro-posts/isomorphic"
import { IntroPostListView } from "./IntroPostListView"

type IntroPostListContainerProps = {
  section: IntroPostSectionKey
}

export function IntroPostListContainer({
  section,
}: IntroPostListContainerProps) {
  const { data, isLoading, isError } = useIntroPostListQuery(section)

  return (
    <IntroPostListView
      section={section}
      items={data ?? []}
      isLoading={isLoading}
      isError={isError}
    />
  )
}
