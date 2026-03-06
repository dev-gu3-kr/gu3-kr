"use client"

import dynamic from "next/dynamic"
import sanitizeHtml from "sanitize-html"

const Viewer = dynamic(
  () => import("@toast-ui/react-editor").then((module) => module.Viewer),
  { ssr: false },
)

type ToastMarkdownViewerProps = {
  content: string
}

function extractYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.replace("www.", "")

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0]
      return id || null
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v")
      }

      const parts = parsed.pathname.split("/").filter(Boolean)
      if (parts[0] === "shorts" || parts[0] === "embed") {
        return parts[1] || null
      }
    }

    return null
  } catch {
    return null
  }
}

function toYouTubeEmbedBlock(url: string) {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null

  const embedUrl = `https://www.youtube.com/embed/${videoId}`

  return [
    '<div class="youtube-embed-block" style="position:relative;width:100%;max-width:860px;margin:16px auto;">',
    '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;">',
    `<iframe src="${embedUrl}" title="YouTube video player" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
    "</div>",
    "</div>",
  ].join("")
}

function replaceYouTubeLinksWithEmbeds(markdown: string) {
  const lines = markdown.split("\n")

  return lines
    .map((line) => {
      const trimmed = line.trim()

      if (!trimmed) return line

      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return toYouTubeEmbedBlock(trimmed) ?? line
      }

      const openBracket = trimmed.indexOf("](")
      if (trimmed.startsWith("[") && openBracket > 0 && trimmed.endsWith(")")) {
        const url = trimmed.slice(openBracket + 2, -1)
        return toYouTubeEmbedBlock(url) ?? line
      }

      return line
    })
    .join("\n")
}

function sanitizeRenderedHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "iframe",
      "div",
      "span",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: [
        "src",
        "title",
        "allow",
        "allowfullscreen",
        "frameborder",
        "width",
        "height",
        "loading",
        "referrerpolicy",
        "style",
      ],
      div: ["class", "style"],
      span: ["class", "style"],
    },
    allowedIframeHostnames: ["www.youtube.com", "youtube.com"],
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
  })
}

export function ToastMarkdownViewer({ content }: ToastMarkdownViewerProps) {
  const transformed = replaceYouTubeLinksWithEmbeds(content || "")

  return (
    <Viewer
      initialValue={transformed}
      customHTMLSanitizer={(html: string) => sanitizeRenderedHtml(html)}
    />
  )
}
