"use client"

import { ToastMarkdownViewer } from "@/components/ToastMarkdownViewer"

type YouthBlogContentViewerProps = {
  content: string
}

export function YouthBlogContentViewer({
  content,
}: YouthBlogContentViewerProps) {
  return <ToastMarkdownViewer content={content || ""} />
}
