// 제목 기반으로 타임스탬프 slug를 생성한다.
export function createTimestampSlug(title: string, fallback: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  return `${base || fallback}-${Date.now()}`
}
