"use client"

import { ToastMarkdownViewer } from "@/components/ToastMarkdownViewer"

type GalleryContentViewerProps = {
  content: string
}

export function GalleryContentViewer({ content }: GalleryContentViewerProps) {
  return <ToastMarkdownViewer content={content || ""} />
}
