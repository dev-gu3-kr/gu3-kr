const URL_PATTERN = /https?:\/\/[^\s<>"]+/gi

function trimTrailingPunctuation(rawUrl: string) {
  return rawUrl.replace(/[),.!?;:]+$/g, "")
}

function isYoutubeHost(hostname: string) {
  const host = hostname.toLowerCase()
  return (
    host === "youtube.com" ||
    host === "www.youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtu.be" ||
    host === "www.youtu.be"
  )
}

function isYoutubeUrl(url: URL) {
  if (!isYoutubeHost(url.hostname)) return false

  if (url.hostname.includes("youtu.be")) {
    return url.pathname.length > 1
  }

  if (url.pathname === "/watch") {
    return Boolean(url.searchParams.get("v")?.trim())
  }

  return (
    url.pathname.startsWith("/shorts/") ||
    url.pathname.startsWith("/embed/") ||
    url.pathname.startsWith("/live/")
  )
}

export function extractFirstYoutubeUrl(content: string) {
  const matches = content.match(URL_PATTERN) ?? []

  for (const raw of matches) {
    const candidate = trimTrailingPunctuation(raw)

    try {
      const parsed = new URL(candidate)
      if (isYoutubeUrl(parsed)) return candidate
    } catch {}
  }

  return null
}
