// Toast UI Viewer로 마크다운 본문(이미지 포함)을 렌더링한다
"use client"

import dynamic from "next/dynamic"

const ToastViewer = dynamic(
  () => import("@toast-ui/react-editor").then((module) => module.Viewer),
  { ssr: false },
)

type YouthBlogContentViewerProps = {
  content: string
}

// Toast UI Viewer로 공지 본문 마크다운을 렌더링한다.
export function YouthBlogContentViewer({
  content,
}: YouthBlogContentViewerProps) {
  return <ToastViewer initialValue={content || ""} />
}
