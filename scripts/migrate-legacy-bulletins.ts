import { randomUUID } from "node:crypto"
import { extname } from "node:path"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import sanitizeHtml from "sanitize-html"
import { getMinioS3Client } from "../src/lib/admin/storage"
import { prisma } from "../src/lib/prisma"

const LEGACY_BASE_URL = "https://guro3cc.com"
const LEGACY_BOARD_URL = `${LEGACY_BASE_URL}/bbs/board.php?bo_table=jubo`
const LEGACY_LAST_PAGE = 27
const LEGACY_SLUG_PREFIX = "legacy-jubo"
const REQUEST_CONCURRENCY = 3
const legacyCookies = new Map<string, string>()

type LegacyListItem = {
  wrId: number
  viewCount: number
}

type LegacyAttachment = {
  sourceUrl: string
  originalName: string
}

type LegacyDetail = LegacyListItem & {
  title: string
  content: string
  createdAt: Date
  sourceUrl: string
  attachments: LegacyAttachment[]
}

type UploadedAttachment = {
  fileName: string
  originalName: string
  mimeType: string
  sizeBytes: number
  url: string
}

type MigrationFailure = {
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
    sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }),
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

async function fetchResponse(url: string, referer = LEGACY_BOARD_URL) {
  let lastError: unknown

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          ...(legacyCookies.size > 0
            ? {
                Cookie: Array.from(legacyCookies)
                  .map(([name, value]) => `${name}=${value}`)
                  .join("; "),
              }
            : {}),
          Referer: referer,
          "User-Agent": "cathedral-nextjs-content-migrator/1.0",
        },
      })
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`)
      }

      const responseHeaders = response.headers as Headers & {
        getSetCookie?: () => string[]
      }
      const setCookies = responseHeaders.getSetCookie?.() ?? []
      for (const setCookie of setCookies) {
        const pair = setCookie.split(";", 1)[0]
        const separator = pair.indexOf("=")
        if (separator > 0) {
          legacyCookies.set(pair.slice(0, separator), pair.slice(separator + 1))
        }
      }
      return response
    } catch (error) {
      lastError = error
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500))
      }
    }
  }

  throw lastError
}

async function fetchText(url: string) {
  return (await fetchResponse(url)).text()
}

function parseListPage(html: string) {
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
    const viewCount = Number.parseInt(
      stripHtml(numberCells.at(-1)?.[1] ?? "0").replaceAll(",", ""),
      10,
    )

    items.push({
      wrId: Number.parseInt(idMatch[1], 10),
      viewCount: Number.isFinite(viewCount) ? viewCount : 0,
    })
  }

  return items
}

async function collectLegacyList() {
  const items = new Map<number, LegacyListItem>()

  for (let page = 1; page <= LEGACY_LAST_PAGE; page += 1) {
    const html = await fetchText(`${LEGACY_BOARD_URL}&page=${page}`)
    for (const item of parseListPage(html)) items.set(item.wrId, item)
  }

  // 구조 확인 과정에서 상세 페이지를 연 최신 주보는 확인 전 목록 조회수로 고정한다.
  const sampledOriginalHits = new Map<number, number>([[408, 400]])
  for (const [wrId, viewCount] of sampledOriginalHits) {
    const item = items.get(wrId)
    if (item) item.viewCount = viewCount
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

function htmlToText(html: string) {
  return stripHtml(
    html
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(p|div|li|tr|h[1-6]|blockquote)>/gi, "\n"),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function parseAttachments(html: string, sourceUrl: string) {
  const fileHtml = extractElementHtml(html, "bo_v_file")
  const attachments: LegacyAttachment[] = []
  const links = fileHtml.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) ?? []

  for (const link of links) {
    const href = readAttribute(link, "href")
    if (!href || !href.includes("/bbs/download.php")) continue
    const originalName = stripHtml(
      link.match(/<strong>([\s\S]*?)<\/strong>/i)?.[1] ?? "",
    )
    if (!originalName) continue
    attachments.push({
      sourceUrl: new URL(href, sourceUrl).toString(),
      originalName,
    })
  }

  return attachments
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

  return {
    ...item,
    title,
    content: htmlToText(extractElementHtml(html, "bo_v_con")),
    createdAt: parseLegacyDate(stripHtml(dateMatch[1])),
    sourceUrl,
    attachments: parseAttachments(html, sourceUrl),
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

function contentTypeForName(originalName: string, responseType: string | null) {
  const normalized = responseType?.split(";")[0].trim().toLowerCase()
  if (
    normalized &&
    normalized !== "application/octet-stream" &&
    normalized !== "file/unknown"
  ) {
    return normalized
  }

  const types: Record<string, string> = {
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".hwp": "application/x-hwp",
    ".hwpx": "application/vnd.hancom.hwpx",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".zip": "application/zip",
  }
  return (
    types[extname(originalName).toLowerCase()] ?? "application/octet-stream"
  )
}

function safeExtension(originalName: string) {
  const extension = extname(originalName)
    .toLowerCase()
    .replace(/[^.a-z0-9]/g, "")
  return extension.length > 1 && extension.length <= 10 ? extension : ".bin"
}

function minioPublicUrl(key: string) {
  const base = (process.env.MINIO_ENDPOINT || "").replace(/\/$/, "")
  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!base || !bucket) throw new Error("MinIO 공개 URL 설정이 비어 있습니다.")
  return `${base}/${bucket}/${key}`
}

async function uploadAttachment(
  detail: LegacyDetail,
  attachment: LegacyAttachment,
) {
  const response = await fetchResponse(attachment.sourceUrl, detail.sourceUrl)
  const body = Buffer.from(await response.arrayBuffer())
  const responseType = response.headers.get("content-type")
  if (body.length === 0 || responseType?.startsWith("text/html")) {
    throw new Error(
      `첨부파일이 비어 있거나 HTML 응답입니다: ${attachment.sourceUrl}`,
    )
  }

  const fileName = `${randomUUID()}${safeExtension(attachment.originalName)}`
  const key = `data/bulletins/${LEGACY_SLUG_PREFIX}/${detail.wrId}/${fileName}`
  const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!bucket) throw new Error("MINIO_PUBLIC_IMAGE_BUCKET이 비어 있습니다.")
  const mimeType = contentTypeForName(attachment.originalName, responseType)

  await getMinioS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: mimeType,
    }),
  )

  return {
    fileName,
    originalName: attachment.originalName,
    mimeType,
    sizeBytes: body.length,
    url: minioPublicUrl(key),
  } satisfies UploadedAttachment
}

async function migrateDetail(detail: LegacyDetail, authorId: string) {
  const slug = `${LEGACY_SLUG_PREFIX}-${detail.wrId}`
  const existing = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (existing) return { status: "skipped" as const, uploaded: 0 }

  const uploaded = [] as UploadedAttachment[]
  const attachmentFailures = [] as MigrationFailure[]
  for (const attachment of detail.attachments) {
    try {
      uploaded.push(await uploadAttachment(detail, attachment))
    } catch (error) {
      attachmentFailures.push({
        wrId: detail.wrId,
        title: detail.title,
        sourceUrl: attachment.sourceUrl,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }

  await prisma.post.create({
    data: {
      category: "BULLETIN",
      title: detail.title,
      slug,
      summary: null,
      content: detail.content,
      youtubeUrl: null,
      isPublished: true,
      publishedAt: detail.createdAt,
      isPinned: false,
      sortOrder: 0,
      viewCount: detail.viewCount,
      legacySourceUrl: detail.sourceUrl,
      authorId,
      createdAt: detail.createdAt,
      updatedAt: detail.createdAt,
      attachments: { create: uploaded },
    },
  })

  return {
    status: "created" as const,
    uploaded: uploaded.length,
    attachmentFailures,
  }
}

async function main() {
  const author = await prisma.user.findUnique({
    where: { username: "master" },
    select: { id: true, isActive: true },
  })
  if (!author?.isActive) throw new Error("활성 master 계정을 찾지 못했습니다.")

  const list = await collectLegacyList()
  console.log(`목록 수집 완료: ${list.length}건`)
  const existingRows = await prisma.post.findMany({
    where: {
      slug: { in: list.map((item) => `${LEGACY_SLUG_PREFIX}-${item.wrId}`) },
    },
    select: { slug: true },
  })
  const existingSlugs = new Set(existingRows.map((row) => row.slug))
  const pending = list.filter(
    (item) => !existingSlugs.has(`${LEGACY_SLUG_PREFIX}-${item.wrId}`),
  )

  if (existingSlugs.size > 0 && pending.length > 0) {
    // 재시도와 원본 파일 유실 확인 과정에서 늘어난 상세 조회 횟수만 제외한다.
    const retryHitAdjustments = new Map<number, number>([
      [26, 4],
      [51, 2],
      [56, 2],
      [88, 2],
      [92, 2],
      [95, 2],
    ])
    for (const item of pending) {
      const adjustment = retryHitAdjustments.get(item.wrId) ?? 1
      item.viewCount = Math.max(0, item.viewCount - adjustment)
    }
  }
  const details = await mapWithConcurrency(
    pending,
    REQUEST_CONCURRENCY,
    collectLegacyDetail,
  )
  console.log(`상세 수집 완료: ${details.length}건`)

  let created = 0
  let uploadedFiles = 0
  const failures = [] as MigrationFailure[]
  const withoutAttachments = [] as number[]

  for (const [index, detail] of details.entries()) {
    if (detail.attachments.length === 0) withoutAttachments.push(detail.wrId)
    try {
      const result = await migrateDetail(detail, author.id)
      if (result.status === "created") {
        created += 1
        uploadedFiles += result.uploaded
        failures.push(...result.attachmentFailures)
      }
    } catch (error) {
      failures.push({
        wrId: detail.wrId,
        title: detail.title,
        sourceUrl: detail.sourceUrl,
        reason: error instanceof Error ? error.message : String(error),
      })
    }

    if ((index + 1) % 10 === 0 || index + 1 === details.length) {
      console.log(
        `진행 ${index + 1}/${details.length}: 생성 ${created}, 실패 ${failures.length}`,
      )
    }
  }

  console.log(
    JSON.stringify(
      {
        sourceCount: list.length,
        created,
        skipped: existingSlugs.size,
        uploadedFiles,
        withoutAttachments,
        failures,
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
