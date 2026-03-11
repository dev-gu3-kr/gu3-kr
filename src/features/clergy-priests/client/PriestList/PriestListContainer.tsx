"use client"

import { useCallback, useState } from "react"
import { usePriestListQuery } from "@/features/clergy-priests/isomorphic"
import { PriestListView } from "./PriestListView"

export function PriestListContainer() {
  const { data, isLoading, isError } = usePriestListQuery()
  const items = data ?? []
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(
    () => new Set(),
  )

  const handleImageError = useCallback((id: string) => {
    setFailedImageIds((prev) => new Set(prev).add(id))
  }, [])

  return (
    <PriestListView
      items={items}
      isLoading={isLoading}
      isError={isError}
      failedImageIds={failedImageIds}
      onImageError={handleImageError}
    />
  )
}
