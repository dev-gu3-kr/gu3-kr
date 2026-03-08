"use client"

import { usePublicPriestListQuery } from "@/features/clergy-priests/isomorphic"
import { PriestIntroPageView } from "./PriestIntroPageView"

export function PriestIntroPageContainer() {
  const { data, isPending, isError, error } = usePublicPriestListQuery()

  const priests = data ?? []
  const currentPriests = priests.filter((item) => item.isCurrent)
  const formerPriests = priests.filter((item) => !item.isCurrent)

  return (
    <PriestIntroPageView
      currentPriests={currentPriests}
      formerPriests={formerPriests}
      isLoading={isPending}
      errorMessage={isError ? error.message : null}
    />
  )
}
