# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS runtime-base

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM runtime-base AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install --global pnpm@10.29.2

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma

# postinstall에서 Prisma Client를 생성하므로 빌드 전용 URL만 주입한다.
RUN DATABASE_URL="postgresql://docker-build:docker-build@localhost:5432/docker-build?schema=cathedral" \
  pnpm install --frozen-lockfile

FROM base AS builder

ARG MINIO_PUBLIC_BASE_URL="http://localhost:9000"
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3000"

ENV NEXT_TELEMETRY_DISABLED=1
ENV MINIO_PUBLIC_BASE_URL="$MINIO_PUBLIC_BASE_URL"
ENV NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL"

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# 실제 운영 DB 없이도 Prisma 생성과 Next.js 빌드가 가능하도록 더미 URL을 사용한다.
RUN DATABASE_URL="postgresql://docker-build:docker-build@localhost:5432/docker-build?schema=cathedral" \
  DATABASE_SCHEMA="cathedral" \
  pnpm run build

FROM base AS migrator

ENV NODE_ENV="production"

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --create-home --home-dir /home/nextjs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]

FROM runtime-base AS runner

ENV NODE_ENV="production"
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --create-home --home-dir /home/nextjs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/scripts/cleanup-pending-content-images.mjs ./scripts/cleanup-pending-content-images.mjs

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
