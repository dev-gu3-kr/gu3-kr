"use client"

import { ToastMarkdownViewer } from "@/components/ToastMarkdownViewer"

type NoticeContentViewerProps = {
  content: string
}

export function NoticeContentViewer({ content }: NoticeContentViewerProps) {
  return <ToastMarkdownViewer content={content || ""} />
}
