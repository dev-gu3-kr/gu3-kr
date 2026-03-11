"use client"

import { useCallback, useState } from "react"
import { useNunListQuery } from "@/features/clergy-nuns/isomorphic"
import { NunListView } from "./NunListView"

export function NunListContainer() {
  const { data, isLoading, isError } = useNunListQuery()
  const items = data ?? []
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(
    () => new Set(),
  )

  const handleImageError = useCallback((id: string) => {
    setFailedImageIds((prev) => new Set(prev).add(id))
  }, [])

  return (
    <NunListView
      items={items}
      isLoading={isLoading}
      isError={isError}
      failedImageIds={failedImageIds}
      onImageError={handleImageError}
    />
  )
}
