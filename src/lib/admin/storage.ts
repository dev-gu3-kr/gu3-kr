import { S3Client } from "@aws-sdk/client-s3"

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
