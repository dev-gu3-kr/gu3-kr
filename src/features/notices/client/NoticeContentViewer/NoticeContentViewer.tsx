// Toast UI Viewer로 마크다운 본문(이미지 포함)을 렌더링한다
"use client"

import { Viewer } from "@toast-ui/react-editor"

type NoticeContentViewerProps = {
  content: string
}

// Toast UI Viewer로 공지 본문 마크다운을 렌더링한다.
export function NoticeContentViewer({ content }: NoticeContentViewerProps) {
  return <Viewer initialValue={content || ""} />
}
