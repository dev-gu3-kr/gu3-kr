"use client"

import dynamic from "next/dynamic"

const ToastViewer = dynamic(
  () => import("@toast-ui/react-editor").then((module) => module.Viewer),
  { ssr: false },
)

type GalleryContentViewerProps = {
  content: string
}

export function GalleryContentViewer({ content }: GalleryContentViewerProps) {
  return <ToastViewer initialValue={content || ""} />
}
