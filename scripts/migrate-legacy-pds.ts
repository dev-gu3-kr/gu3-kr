import { randomUUID } from "node:crypto"
import { extname } from "node:path"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import sanitizeHtml from "sanitize-html"
import { getMinioS3Client } from "../src/lib/admin/storage"
import { prisma } from "../src/lib/prisma"
import { extractFirstYoutubeUrl } from "../src/lib/youtube"

const LEGACY_BASE_URL = "https://guro3cc.com"
const LEGACY_BOARD_TABLE = process.env.LEGACY_BOARD_TABLE || "pds"
const LEGACY_LAST_PAGE = Number.parseInt(
  process.env.LEGACY_LAST_PAGE ||
    (LEGACY_BOARD_TABLE === "notice"
      ? "4"
      : LEGACY_BOARD_TABLE === "gallery"
        ? "5"
        : LEGACY_BOARD_TABLE === "video"
          ? "2"
          : "17"),
  10,
)
const LEGACY_BOARD_URL = `${LEGACY_BASE_URL}/bbs/board.php?bo_table=${LEGACY_BOARD_TABLE}`
const LEGACY_SLUG_PREFIX = `legacy-${LEGACY_BOARD_TABLE}`
const TARGET_CATEGORY =
  LEGACY_BOARD_TABLE === "bbs"
    ? "LEGACY_BOARD"
    : LEGACY_BOARD_TABLE === "pds" ||
        LEGACY_BOARD_TABLE === "gallery" ||
        LEGACY_BOARD_TABLE === "video"
      ? "GALLERY"
      : "NOTICE"
const MIN_WR_ID = LEGACY_BOARD_TABLE === "pds" ? 2 : 0
const REQUEST_CONCURRENCY = 3

type LegacyListItem = {
  wrId: number
  viewCount: number
  isPinned: boolean
}

type LegacyDetail = LegacyListItem & {
  title: string
  createdAt: Date
  contentHtml: string
  imageHtml: string
  sourceUrl: string
}

type UploadedImage = {
  sourceUrl: string
  publicUrl: string
  alt: string
  bucket: string
  objectKey: string
  originalName: string
  mimeType: string
  sizeBytes: number
}

type ImageMigrationFailure = {
  wrId: number
  title: string
  sourceUrl: string
  reason: string
}

function decodeHtml(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  }

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(code.slice(2), 16))
    }

    if (code.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(code.slice(1), 10))
    }

    return namedEntities[code.toLowerCase()] ?? entity
  })
}

function stripHtml(value: string) {
  return decodeHtml(
    sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    }),
  )
    .replace(/\u00a0/g, " ")
    .trim()
}

function readAttribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"))
  return match ? decodeHtml(match[2]) : null
}

// 중첩된 동일 태그가 있어도 지정한 id 요소의 내부 HTML 전체를 보존한다.
function extractElementHtml(html: string, id: string) {
  const opening = html.match(
    new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*\\bid=["']${id}["'][^>]*>`, "i"),
  )
  if (!opening || opening.index === undefined) return ""

  const tagName = opening[1]
  const contentStart = opening.index + opening[0].length
  const tagPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi")
  tagPattern.lastIndex = contentStart

  let depth = 1
  let match = tagPattern.exec(html)

  while (match) {
    if (match[0].startsWith("</")) {
      depth -= 1
      if (depth === 0) return html.slice(contentStart, match.index)
    } else if (!match[0].endsWith("/>")) {
      depth += 1
    }

    match = tagPattern.exec(html)
  }

  throw new Error(`닫는 태그를 찾지 못했습니다: #${id}`)
}

async function fetchText(url: string) {
  let lastError: unknown

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Referer: LEGACY_BASE_URL,
          "User-Agent": "cathedral-nextjs-content-migrator/1.0",
        },
      })

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      lastError = error
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500))
      }
    }
  }

  throw lastError
}

function parseListPage(html: string) {
  if (LEGACY_BOARD_TABLE === "gallery" || LEGACY_BOARD_TABLE === "video") {
    const galleryHtml = extractElementHtml(html, "gall_ul")
    const wrIds = new Set<number>()
    for (const match of galleryHtml.matchAll(
      new RegExp(`bo_table=${LEGACY_BOARD_TABLE}(?:&amp;|&)wr_id=(\\d+)`, "gi"),
    )) {
      wrIds.add(Number.parseInt(match[1], 10))
    }
    return Array.from(wrIds).map((wrId) => ({
      wrId,
      viewCount: 0,
      isPinned: false,
    }))
  }

  const items: LegacyListItem[] = []
  const rows = html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? []

  for (const row of rows) {
    const idMatch = row.match(/(?:&amp;|&)wr_id=(\d+)/i)
    if (!idMatch) continue

    const numberCells = Array.from(
      row.matchAll(
        /<td\b[^>]*class=["'][^"']*td_num[^"']*["'][^>]*>([\s\S]*?)<\/td>/gi,
      ),
    )
    const hitText = numberCells.at(-1)?.[1]
    const viewCount = Number.parseInt(
      stripHtml(hitText ?? "0").replaceAll(",", ""),
      10,
    )

    items.push({
      wrId: Number.parseInt(idMatch[1], 10),
      viewCount: Number.isFinite(viewCount) ? viewCount : 0,
      isPinned: /<strong>\s*공지\s*<\/strong>/i.test(row),
    })
  }

  return items
}

async function collectLegacyList() {
  const items = new Map<number, LegacyListItem>()

  for (let page = 1; page <= LEGACY_LAST_PAGE; page += 1) {
    const html = await fetchText(`${LEGACY_BOARD_URL}&page=${page}`)
    for (const item of parseListPage(html)) {
      const existing = items.get(item.wrId)
      items.set(item.wrId, {
        ...item,
        isPinned: Boolean(existing?.isPinned || item.isPinned),
      })
    }
  }

  // 사전 유형 확인 중 증가한 원본 조회수는 이관 값에서 제외한다.
  const sampledOriginalHits = new Map<number, number>(
    LEGACY_BOARD_TABLE === "bbs"
      ? [
          [2, 2_320],
          [5, 2_089],
          [6, 2_158],
          [7, 1_959],
        ]
      : LEGACY_BOARD_TABLE === "notice"
        ? [[61, 9_356]]
        : [[2, 16_553]],
  )
  const sampledHitAdjustments = new Map<number, number>(
    LEGACY_BOARD_TABLE === "pds" ? [[100, 1]] : [],
  )

  for (const [wrId, viewCount] of sampledOriginalHits) {
    const item = items.get(wrId)
    if (item) item.viewCount = viewCount
  }

  for (const [wrId, adjustment] of sampledHitAdjustments) {
    const item = items.get(wrId)
    if (item) item.viewCount = Math.max(0, item.viewCount - adjustment)
  }

  return Array.from(items.values()).sort(
    (left, right) => left.wrId - right.wrId,
  )
}

function parseLegacyDate(raw: string) {
  const match = raw.trim().match(/^(\d{2})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/)
  if (!match) throw new Error(`등록일 형식을 해석할 수 없습니다: ${raw}`)

  const [, year, month, day, hour, minute] = match
  return new Date(`20${year}-${month}-${day}T${hour}:${minute}:00+09:00`)
}

function extractRelatedLinkHtml(html: string) {
  return (
    extractElementHtml(html, "bo_v_link").match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) ??
    []
  )
    .map((link) => link.replace(/<img\b[^>]*>/gi, ""))
    .join("<br>")
}

async function collectLegacyDetail(item: LegacyListItem) {
  const sourceUrl = `${LEGACY_BOARD_URL}&wr_id=${item.wrId}`
  const html = await fetchText(sourceUrl)
  const title = stripHtml(extractElementHtml(html, "bo_v_title"))
  const infoHtml = extractElementHtml(html, "bo_v_info")
  const dateMatch = infoHtml.match(
    /작성일<\/span>\s*<strong>([^<]+)<\/strong>/i,
  )

  if (!title || !dateMatch) {
    throw new Error(`필수 상세 정보를 찾지 못했습니다: wr_id=${item.wrId}`)
  }

  const hitMatch = infoHtml.match(/조회\s*<strong>([\d,]+)회<\/strong>/i)
  const displayedHit = Number.parseInt(
    stripHtml(hitMatch?.[1] ?? "0").replaceAll(",", ""),
    10,
  )
  const galleryInspectionAdjustment =
    (LEGACY_BOARD_TABLE === "gallery" && item.wrId === 312) ||
    (LEGACY_BOARD_TABLE === "video" && item.wrId === 17)
      ? 2
      : 1
  const viewCount =
    (LEGACY_BOARD_TABLE === "gallery" || LEGACY_BOARD_TABLE === "video") &&
    Number.isFinite(displayedHit)
      ? Math.max(0, displayedHit - galleryInspectionAdjustment)
      : item.viewCount

  return {
    ...item,
    viewCount,
    title,
    createdAt: parseLegacyDate(stripHtml(dateMatch[1])),
    contentHtml: `${extractRelatedLinkHtml(html)}\n${extractElementHtml(html, "bo_v_con")}`,
    imageHtml: extractElementHtml(html, "bo_v_img"),
    sourceUrl,
  } satisfies LegacyDetail
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
) {
  const results = new Array<R>(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapper(items[index])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  )
  return results
}

function normalizeYoutubeUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl, LEGACY_BASE_URL)
    const host = url.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0]
      return id ? `https://www.youtube.com/watch?v=${id}` : rawUrl
    }

    if (host === "youtube.com") {
      const parts = url.pathname.split("/").filter(Boolean)
      if (["embed", "shorts", "v", "live"].includes(parts[0]) && parts[1]) {
        return `https://www.youtube.com/watch?v=${parts[1]}`
      }
    }

    return url.toString()
  } catch {
    return rawUrl
  }
}

function fileExtension(sourceUrl: string, contentType: string) {
  const fromPath = extname(new URL(sourceUrl).pathname)
    .replace(".", "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
  if (fromPath && fromPath.length <= 5) return fromPath

  const extensions: Record<string, string> = {
    "image/bmp": "bmp",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/svg+xml": "svg",
    "image/webp": "webp",
  }
  return extensions[contentType.split(";")[0]] ?? "bin"
}

function minioPublicUrl(key: string) {
  // 기존 업로드 API와 동일한 S3 객체 엔드포인트를 사용해야 이미지 바이트가 반환된다.
  const base = (process.env.MINIO_ENDPOINT || "").replace(/\/$/, "")
  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!base || !bucket) throw new Error("MinIO 공개 URL 설정이 비어 있습니다.")
  return `${base}/${bucket}/${key}`
}

async function uploadLegacyImage(params: {
  wrId: number
  sourceUrl: string
  alt: string
}) {
  const response = await fetch(params.sourceUrl, {
    headers: {
      Referer: `${LEGACY_BOARD_URL}&wr_id=${params.wrId}`,
      "User-Agent": "cathedral-nextjs-content-migrator/1.0",
    },
  })
  if (!response.ok) {
    throw new Error(
      `이미지 다운로드 실패(${response.status}): ${params.sourceUrl}`,
    )
  }

  const contentType =
    response.headers.get("content-type") || "application/octet-stream"
  const body = Buffer.from(await response.arrayBuffer())
  if (!contentType.startsWith("image/") || body.length === 0) {
    throw new Error(
      `원본 이미지가 비어 있거나 이미지 형식이 아닙니다: ${params.sourceUrl}`,
    )
  }
  const extension = fileExtension(params.sourceUrl, contentType)
  const key = `data/notices/${LEGACY_SLUG_PREFIX}/${params.wrId}/${randomUUID()}.${extension}`
  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!bucket) throw new Error("MINIO_PUBLIC_IMAGE_BUCKET이 비어 있습니다.")

  await getMinioS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )

  return {
    sourceUrl: params.sourceUrl,
    publicUrl: minioPublicUrl(key),
    alt: params.alt,
    bucket,
    objectKey: key,
    originalName:
      decodeURIComponent(
        new URL(params.sourceUrl).pathname.split("/").at(-1) || "",
      ) || `${params.wrId}.${extension}`,
    mimeType: contentType.split(";")[0],
    sizeBytes: body.length,
  } satisfies UploadedImage
}

function toFullSizeImageUrl(sourceUrl: string) {
  const url = new URL(sourceUrl)
  const fileName = url.pathname.split("/").at(-1) || ""
  const thumbnail = fileName.match(/^thumb-(.+)_\d+x\d+(\.[a-z0-9]+)$/i)
  if (!thumbnail) return sourceUrl

  url.pathname = url.pathname.replace(
    fileName,
    `${thumbnail[1]}${thumbnail[2]}`,
  )
  return url.toString()
}

function collectImageTags(detail: LegacyDetail) {
  const combined = `${detail.imageHtml}\n${detail.contentHtml}`
  const unique = new Map<
    string,
    { sourceUrl: string; downloadUrl: string; alt: string }
  >()

  function isLegacyUiAsset(sourceUrl: string) {
    const path = new URL(sourceUrl).pathname
    return path.includes("/theme/") || path.includes("/skin/board/")
  }

  for (const match of combined.matchAll(
    /<a\b[^>]*href=(["'])([^"']*\/bbs\/view_image\.php[^"']*)\1[^>]*>[\s\S]*?<img\b[^>]*>[\s\S]*?<\/a>/gi,
  )) {
    const imageTag = match[0].match(/<img\b[^>]*>/i)?.[0]
    const source = imageTag ? readAttribute(imageTag, "src") : null
    if (!source) continue
    const sourceUrl = new URL(source, detail.sourceUrl).toString()
    if (isLegacyUiAsset(sourceUrl)) continue
    const viewUrl = new URL(decodeHtml(match[2]), detail.sourceUrl)
    const originalName = viewUrl.searchParams.get("fn")
    if (!originalName) continue
    unique.set(sourceUrl, {
      sourceUrl,
      downloadUrl: `${LEGACY_BASE_URL}/data/file/${LEGACY_BOARD_TABLE}/${originalName}`,
      alt: readAttribute(imageTag ?? "", "alt") || detail.title,
    })
  }

  for (const match of combined.matchAll(/<img\b[^>]*>/gi)) {
    const source = readAttribute(match[0], "src")
    if (!source) continue
    const sourceUrl = new URL(source, detail.sourceUrl).toString()
    if (isLegacyUiAsset(sourceUrl)) continue
    if (!unique.has(sourceUrl)) {
      unique.set(sourceUrl, {
        sourceUrl,
        downloadUrl: toFullSizeImageUrl(sourceUrl),
        alt: readAttribute(match[0], "alt") || detail.title,
      })
    }
  }

  return Array.from(unique.values())
}

function htmlToMarkdown(detail: LegacyDetail, images: UploadedImage[]) {
  const imageMap = new Map(images.map((image) => [image.sourceUrl, image]))
  let content = `${detail.imageHtml}\n${detail.contentHtml}`

  content = content.replace(/<img\b[^>]*>/gi, (tag) => {
    const source = readAttribute(tag, "src")
    if (!source) return ""
    const sourceUrl = new URL(source, detail.sourceUrl).toString()
    const image = imageMap.get(sourceUrl)
    return image
      ? `\n\n![${image.alt.replaceAll("]", "")}](${image.publicUrl})\n\n`
      : ""
  })

  content = content.replace(/<(iframe|embed)\b[^>]*>/gi, (tag) => {
    const source = readAttribute(tag, "src")
    return source ? `\n\n${normalizeYoutubeUrl(source)}\n\n` : ""
  })

  content = content.replace(
    /<video\b[^>]*src=(["'])(.*?)\1[^>]*>[\s\S]*?<\/video>/gi,
    (_tag, _quote, source: string) => {
      return `\n\n${new URL(decodeHtml(source), detail.sourceUrl).toString()}\n\n`
    },
  )

  content = content.replace(
    /<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi,
    (_tag, _quote, href: string, label: string) => {
      const url = new URL(decodeHtml(href), detail.sourceUrl).toString()
      const text = stripHtml(label)
      const visibleUrl = text.match(/https?:\/\/\S+/i)?.[0]
      const resolvedUrl =
        url.includes("/bbs/link.php") && visibleUrl ? visibleUrl : url
      return text ? `[${text}](${resolvedUrl})` : resolvedUrl
    },
  )

  // 새 MinIO 이미지가 옛 사이트의 확대보기 링크로 감싸지지 않게 한다.
  content = content.replace(
    /\[(!\[[^\]]*\]\(https:\/\/(?:api|io)\.gu3\.kr\/live\/[^)]+\))\]\([^)]*\/bbs\/view_image\.php[^)]*\)/gi,
    "$1",
  )

  content = content
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6]|blockquote)>/gi, "\n")
    .replace(/<(p|div|li|tr|h[1-6]|blockquote)\b[^>]*>/gi, "\n")

  return stripHtml(content)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

async function migrateDetail(detail: LegacyDetail, authorId: string) {
  const slug = `${LEGACY_SLUG_PREFIX}-${detail.wrId}`
  const existing = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (existing) return { status: "skipped" as const, imageCount: 0 }

  const imageTags = collectImageTags(detail)
  const images = [] as UploadedImage[]
  const failedImages = [] as ImageMigrationFailure[]
  for (const image of imageTags) {
    try {
      const uploaded = await uploadLegacyImage({
        wrId: detail.wrId,
        sourceUrl: image.downloadUrl,
        alt: image.alt,
      })
      images.push({ ...uploaded, sourceUrl: image.sourceUrl })
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      failedImages.push({
        wrId: detail.wrId,
        title: detail.title,
        sourceUrl: image.sourceUrl,
        reason,
      })
      console.warn(`이미지 이관 제외: wr_id=${detail.wrId} ${reason}`)
    }
  }

  const content = htmlToMarkdown(detail, images)
  const youtubeUrl = extractFirstYoutubeUrl(content)

  await prisma.post.create({
    data: {
      category: TARGET_CATEGORY,
      title: detail.title,
      slug,
      summary: null,
      content,
      youtubeUrl,
      isPublished: TARGET_CATEGORY !== "LEGACY_BOARD",
      publishedAt: TARGET_CATEGORY === "LEGACY_BOARD" ? null : detail.createdAt,
      isPinned: detail.isPinned,
      sortOrder: 0,
      viewCount: detail.viewCount,
      legacySourceUrl: detail.sourceUrl,
      authorId,
      createdAt: detail.createdAt,
      updatedAt: detail.createdAt,
      ...((TARGET_CATEGORY === "GALLERY" ||
        TARGET_CATEGORY === "LEGACY_BOARD") &&
      images.length > 0
        ? {
            fileUsages: {
              create: images.map((image, index) => ({
                role: index === 0 ? "COVER" : "CONTENT",
                sortOrder: index,
                createdAt: detail.createdAt,
                asset: {
                  create: {
                    bucket: image.bucket,
                    objectKey: image.objectKey,
                    originalName: image.originalName,
                    mimeType: image.mimeType,
                    sizeBytes: image.sizeBytes,
                    url: image.publicUrl,
                    uploadedById: authorId,
                    createdAt: detail.createdAt,
                  },
                },
              })),
            },
          }
        : {}),
    },
  })

  return {
    status: "created" as const,
    imageCount: images.length,
    hasYoutube: Boolean(youtubeUrl),
    failedImages,
  }
}

async function main() {
  const author = await prisma.user.findUnique({
    where: { username: "master" },
    select: { id: true, isActive: true },
  })
  if (!author?.isActive) throw new Error("활성 master 계정을 찾지 못했습니다.")

  const list = await collectLegacyList()
  const targets = list.filter((item) => item.wrId >= MIN_WR_ID)
  console.log(
    `목록 수집 완료: 전체 ${list.length}건, 이관 대상 ${targets.length}건`,
  )

  const existingRows = await prisma.post.findMany({
    where: {
      slug: { in: targets.map((item) => `${LEGACY_SLUG_PREFIX}-${item.wrId}`) },
    },
    select: { slug: true },
  })
  const existingSlugs = new Set(existingRows.map((row) => row.slug))
  const pendingTargets = targets.filter(
    (item) => !existingSlugs.has(`${LEGACY_SLUG_PREFIX}-${item.wrId}`),
  )

  if (existingSlugs.size > 0 && pendingTargets.length > 0) {
    // 중단 전 상세 수집으로 원본 조회수가 한 번 증가했으므로 미저장 글만 보정한다.
    for (const item of pendingTargets) {
      item.viewCount = Math.max(0, item.viewCount - 1)
    }

    // 실패 원인 조사로 한 번 더 열어 본 글의 조회수를 추가 보정한다.
    const inspectedFailure =
      LEGACY_BOARD_TABLE === "pds"
        ? pendingTargets.find((item) => item.wrId === 232)
        : null
    if (inspectedFailure) {
      inspectedFailure.viewCount = Math.max(0, inspectedFailure.viewCount - 1)
    }
  }

  const details = await mapWithConcurrency(
    pendingTargets,
    REQUEST_CONCURRENCY,
    collectLegacyDetail,
  )
  console.log(`상세 수집 완료: ${details.length}건`)

  let created = 0
  let skipped = 0
  let imageCount = 0
  let youtubeCount = 0
  const failedImages = [] as ImageMigrationFailure[]

  for (const [index, detail] of details.entries()) {
    const result = await migrateDetail(detail, author.id)
    if (result.status === "skipped") {
      skipped += 1
    } else {
      created += 1
      imageCount += result.imageCount
      if (result.hasYoutube) youtubeCount += 1
      failedImages.push(...result.failedImages)
    }

    if ((index + 1) % 10 === 0 || index + 1 === details.length) {
      console.log(
        `진행 ${index + 1}/${details.length}: 생성 ${created}, 건너뜀 ${skipped}`,
      )
    }
  }

  console.log(
    JSON.stringify(
      {
        sourceCount: list.length,
        targetCount: targets.length,
        created,
        skipped: skipped + existingSlugs.size,
        uploadedImages: imageCount,
        youtubePosts: youtubeCount,
        failedImages,
      },
      null,
      2,
    ),
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
