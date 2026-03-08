"use client"

import { usePublicNunListQuery } from "@/features/clergy-nuns/isomorphic"
import { NunIntroPageView } from "./NunIntroPageView"

export function NunIntroPageContainer() {
  const { data, isPending, isError, error } = usePublicNunListQuery()

  const nuns = data ?? []
  const currentNuns = nuns.filter((item) => item.isCurrent)
  const formerNuns = nuns.filter((item) => !item.isCurrent)

  return (
    <NunIntroPageView
      currentNuns={currentNuns}
      formerNuns={formerNuns}
      isLoading={isPending}
      errorMessage={isError ? error.message : null}
    />
  )
}
