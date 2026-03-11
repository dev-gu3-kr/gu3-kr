"use client"

import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"

type ReactMarkdownViewerProps = {
  content: string
}

export function ReactMarkdownViewer({ content }: ReactMarkdownViewerProps) {
  return (
    <div className="prose prose-neutral max-w-none break-words prose-img:rounded-md prose-a:text-blue-700 hover:prose-a:text-blue-800">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeSanitize]}>
        {content || ""}
      </ReactMarkdown>
    </div>
  )
}
