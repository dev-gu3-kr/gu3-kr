import { S3Client } from "@aws-sdk/client-s3"

type MinioObjectReference = {
  key?: string
  url?: string
  bucket: string
}

// 업로드/삭제에 사용할 MinIO(S3 호환) 클라이언트를 생성한다.
export function getMinioS3Client() {
  const endpoint = process.env.MINIO_ENDPOINT
  const accessKeyId = process.env.MINIO_ACCESS_KEY
  const secretAccessKey = process.env.MINIO_SECRET_KEY

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("MINIO 설정이 비어 있습니다.")
  }

  return new S3Client({
    endpoint,
    region: process.env.MINIO_REGION || "us-east-1",
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  })
}

// 내부 MinIO endpoint가 외부 응답에 노출되지 않도록 공개 base URL로 객체 URL을 만든다.
export function createMinioPublicObjectUrl(bucket: string, key: string) {
  const publicBaseUrl = process.env.MINIO_PUBLIC_BASE_URL?.replace(/\/$/, "")

  if (!publicBaseUrl) {
    throw new Error("MINIO 공개 URL 설정이 비어 있습니다.")
  }

  return `${publicBaseUrl}/${bucket}/${key}`
}

// 기존·신규 공개 URL의 호스트와 무관하게 버킷 뒤의 실제 object key를 복원한다.
export function extractMinioObjectKey(raw: string, bucket: string) {
  const normalized = raw.trim()
  const marker = `/${bucket}/`
  const markerIndex = normalized.indexOf(marker)

  if (markerIndex < 0) return normalized

  return normalized.slice(markerIndex + marker.length)
}

// 삭제 API가 명시적 key와 기존 DB URL을 동일한 object key 계약으로 처리하게 한다.
export function resolveMinioObjectKey({
  key,
  url,
  bucket,
}: MinioObjectReference) {
  if (key?.trim()) return key.trim()
  if (!url?.trim()) return null

  const objectKey = extractMinioObjectKey(url, bucket)
  return objectKey === url.trim() && url.includes("://") ? null : objectKey
}
