import Image from "next/image"
import { FeastMarkerIcon } from "@/components/svgs"
import type { NunListItemDto } from "@/features/clergy-nuns/isomorphic"

type NunIntroPageViewProps = {
  readonly currentNuns: NunListItemDto[]
  readonly formerNuns: NunListItemDto[]
  readonly isLoading: boolean
  readonly errorMessage: string | null
}

const CURRENT_SKELETON_KEYS = ["current-a", "current-b", "current-c"] as const
const FORMER_SKELETON_KEYS = [
  "former-a",
  "former-b",
  "former-c",
  "former-d",
  "former-e",
] as const

function formatTermRange(item: NunListItemDto) {
  const start = item.termStart ? item.termStart.slice(0, 10) : null
  const end = item.termEnd ? item.termEnd.slice(0, 10) : null

  if (!start && !end) return "재임 정보 준비 중"
  if (start && !end) return `${start} ~ 현재`
  if (!start && end) return `~ ${end}`
  return `${start} ~ ${end}`
}

function formatFeastLabel(item: NunListItemDto) {
  if (!item.feastMonth || !item.feastDay) return "축일 정보 준비 중"
  return `축일: ${item.feastMonth}월 ${item.feastDay}일`
}

function NunPhoto({ nun }: { nun: NunListItemDto }) {
  if (nun.imageUrl) {
    return (
      <div className="relative h-[128px] w-[104px] shrink-0 overflow-hidden rounded-[12px] bg-[#d9d9d9]">
        <Image
          src={nun.imageUrl}
          alt={`${nun.name} 수녀님 사진`}
          fill
          sizes="104px"
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div className="flex h-[128px] w-[104px] shrink-0 items-center justify-center rounded-[12px] bg-[#ececef]">
      <Image
        src="/images/placeholders/nun-profile-placeholder.webp"
        alt="수녀님 기본 이미지"
        width={104}
        height={128}
        className="h-[128px] w-[104px] object-cover"
      />
    </div>
  )
}

function NunCard({ nun }: { nun: NunListItemDto }) {
  return (
    <article className="flex min-h-[150px] items-start gap-5 rounded-[18px] bg-[#f7f7f7] p-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <NunPhoto nun={nun} />

      <div className="flex min-h-[128px] flex-1 flex-col py-1 pr-2">
        <div className="space-y-0.5">
          <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.02em] text-[#111111]">
            {nun.name}
            {nun.baptismalName ? ` ${nun.baptismalName}` : ""}
          </h3>
          <p className="text-[15px] leading-6 text-[#7a7a7a]">{nun.duty}</p>
        </div>

        <div className="mt-auto space-y-1.5 pt-5">
          <div className="flex items-center gap-2 text-[15px] text-[#333333]">
            <FeastMarkerIcon className="relative -top-0.5 h-4 w-4 shrink-0" />
            <span>{formatFeastLabel(nun)}</span>
          </div>
          <p className="text-[14px] leading-5 text-[#8a8a8a]">
            {formatTermRange(nun)}
          </p>
        </div>
      </div>
    </article>
  )
}

function NunCardSkeleton({ variant }: { variant: "current" | "former" }) {
  return (
    <article className="flex min-h-[150px] items-start gap-5 rounded-[18px] bg-[#f7f7f7] p-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div
        className={
          variant === "current"
            ? "h-[128px] w-[104px] shrink-0 animate-pulse rounded-[12px] bg-[#4a4a4a]"
            : "h-[128px] w-[104px] shrink-0 animate-pulse rounded-[12px] bg-[#e7e7eb]"
        }
      />
      <div className="flex min-h-[128px] flex-1 flex-col py-1 pr-2">
        <div className="space-y-1.5">
          <div className="h-7 w-40 animate-pulse rounded bg-[#dddddd]" />
          <div className="h-5 w-24 animate-pulse rounded bg-[#e5e5e5]" />
        </div>
        <div className="mt-auto space-y-1.5 pt-5">
          <div className="h-5 w-32 animate-pulse rounded bg-[#e3e3e3]" />
          <div className="h-4 w-36 animate-pulse rounded bg-[#ebebeb]" />
        </div>
      </div>
    </article>
  )
}

export function NunIntroPageView({
  currentNuns,
  formerNuns,
  isLoading,
  errorMessage,
}: NunIntroPageViewProps) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
      <div className="space-y-10">
        <header className="space-y-3">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#111111] md:text-[24px]">
            수녀님 소개
          </h2>
          <p className="text-[16px] font-medium leading-7 text-[#222222]">
            본당을 위해 애쓰시는 구로3동성당 수녀님을 소개합니다.
          </p>
        </header>

        {errorMessage ? (
          <section className="rounded-[18px] border border-[#efc8c8] bg-[#fff4f4] p-5 text-sm text-[#8a4545]">
            {errorMessage}
          </section>
        ) : null}

        <section className="space-y-5">
          <h3 className="text-[18px] font-medium text-[#8a8a8a]">
            현재 수녀님
          </h3>
          <div className="grid gap-7 xl:grid-cols-3">
            {isLoading
              ? CURRENT_SKELETON_KEYS.map((key) => (
                  <NunCardSkeleton key={key} variant="current" />
                ))
              : currentNuns.map((nun) => <NunCard key={nun.id} nun={nun} />)}
          </div>
          {!isLoading && currentNuns.length === 0 ? (
            <div className="rounded-[18px] bg-[#f7f7f7] p-8 text-sm text-[#7f7f7f]">
              현재 공개된 수녀님 정보가 없습니다.
            </div>
          ) : null}
        </section>

        {isLoading || formerNuns.length > 0 ? (
          <section className="space-y-5">
            <h3 className="text-[18px] font-medium text-[#8a8a8a]">
              이전 수녀님
            </h3>
            <div className="grid gap-7 xl:grid-cols-3">
              {isLoading
                ? FORMER_SKELETON_KEYS.map((key) => (
                    <NunCardSkeleton key={key} variant="former" />
                  ))
                : formerNuns.map((nun) => <NunCard key={nun.id} nun={nun} />)}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  )
}
