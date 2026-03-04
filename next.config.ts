import type { NextConfig } from "next"

const minioEndpoint = process.env.MINIO_ENDPOINT

const minioRemotePattern = (() => {
  if (!minioEndpoint) return null

  try {
    const parsed = new URL(minioEndpoint)
    return {
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port || "",
      pathname: "/**",
    }
  } catch {
    return null
  }
})()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [...(minioRemotePattern ? [minioRemotePattern] : [])],
  },
}

export default nextConfig
