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
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    })

    return config
  },
  images: {
    remotePatterns: [...(minioRemotePattern ? [minioRemotePattern] : [])],
    // 과도한 변형 폭 생성을 줄여 캐시 분산을 완화한다.
    deviceSizes: [640, 768, 1024, 1280],
    imageSizes: [320, 480],
    // 목록 썸네일 중심 환경이라 webp 우선으로 CPU/용량 균형을 맞춘다.
    formats: ["image/webp"],
    // 최적화 결과를 하루 이상 유지해 재방문 미스 비용을 줄인다.
    minimumCacheTTL: 60 * 60 * 24,
  },
}

export default nextConfig
