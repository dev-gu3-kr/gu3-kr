"use client"

import { useCallback, useState } from "react"
import { usePastoralCouncilListQuery } from "@/features/pastoral-council/isomorphic"
import { PastoralCouncilListView } from "./PastoralCouncilListView"

export function PastoralCouncilListContainer() {
  const { data, isLoading, isError } = usePastoralCouncilListQuery()

  const items = data ?? []
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(
    () => new Set(),
  )

  const handleImageError = useCallback((id: string) => {
    setFailedImageIds((prev) => new Set(prev).add(id))
  }, [])

  return (
    <PastoralCouncilListView
      items={items}
      isLoading={isLoading}
      isError={isError}
      failedImageIds={failedImageIds}
      onImageError={handleImageError}
    />
  )
}
