"use client"

import { Viewer } from "@toast-ui/react-editor"

type NoticeContentViewerProps = {
  content: string
}

export function NoticeContentViewer({ content }: NoticeContentViewerProps) {
  return <Viewer initialValue={content || ""} />
}
