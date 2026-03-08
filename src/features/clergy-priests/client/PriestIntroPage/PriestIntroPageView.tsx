import { Cross } from "lucide-react"
import Image from "next/image"
import type { PriestListItemDto } from "@/features/clergy-priests/isomorphic"

type PriestIntroPageViewProps = {
  readonly currentPriests: PriestListItemDto[]
  readonly formerPriests: PriestListItemDto[]
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

function formatTermRange(item: PriestListItemDto) {
  const start = item.termStart ? item.termStart.slice(0, 10) : null
  const end = item.termEnd ? item.termEnd.slice(0, 10) : null

  if (!start && !end) return "재임 정보 준비 중"
  if (start && !end) return `${start} ~ 현재`
  if (!start && end) return `~ ${end}`
  return `${start} ~ ${end}`
}

function formatFeastLabel(item: PriestListItemDto) {
  if (!item.feastMonth || !item.feastDay) return "축일 정보 준비 중"
  return `축일: ${item.feastMonth}월 ${item.feastDay}일`
}

function PriestPhoto({ priest }: { priest: PriestListItemDto }) {
  if (priest.imageUrl) {
    return (
      <div className="relative h-[128px] w-[104px] shrink-0 overflow-hidden rounded-[12px] bg-[#d9d9d9]">
        <Image
          src={priest.imageUrl}
          alt={`${priest.name} 신부님 사진`}
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
        src="/images/placeholders/priest-profile-placeholder.webp"
        alt="신부님 기본 이미지"
        width={104}
        height={128}
        className="h-[128px] w-[104px] object-cover"
      />
    </div>
  )
}

function PriestCard({ priest }: { priest: PriestListItemDto }) {
  return (
    <article className="flex min-h-[150px] items-start gap-5 rounded-[18px] bg-[#f7f7f7] p-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <PriestPhoto priest={priest} />

      <div className="flex min-h-[128px] flex-1 flex-col py-1 pr-2">
        <div className="space-y-0.5">
          <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.02em] text-[#111111]">
            {priest.name}
            {priest.baptismalName ? ` ${priest.baptismalName}` : ""}
          </h3>
          <p className="text-[15px] leading-6 text-[#7a7a7a]">{priest.duty}</p>
        </div>

        <div className="mt-auto space-y-1.5 pt-5">
          <div className="flex items-center gap-2 text-[15px] text-[#333333]">
            <Cross
              className="size-4 shrink-0 text-[#f0c744]"
              strokeWidth={2.5}
            />
            <span>{formatFeastLabel(priest)}</span>
          </div>
          <p className="text-[14px] leading-5 text-[#8a8a8a]">
            {formatTermRange(priest)}
          </p>
        </div>
      </div>
    </article>
  )
}

function PriestCardSkeleton({ variant }: { variant: "current" | "former" }) {
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

export function PriestIntroPageView({
  currentPriests,
  formerPriests,
  isLoading,
  errorMessage,
}: PriestIntroPageViewProps) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
      <div className="space-y-10">
        <header className="space-y-3">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#111111] md:text-[24px]">
            신부님 소개
          </h2>
          <p className="text-[16px] font-medium leading-7 text-[#222222]">
            본당을 위해 애쓰시는 구로3동성당 신부님을 소개합니다.
          </p>
        </header>

        {errorMessage ? (
          <section className="rounded-[18px] border border-[#efc8c8] bg-[#fff4f4] p-5 text-sm text-[#8a4545]">
            {errorMessage}
          </section>
        ) : null}

        <section className="space-y-5">
          <h3 className="text-[18px] font-medium text-[#8a8a8a]">
            현재 신부님
          </h3>
          <div className="grid gap-7 xl:grid-cols-3">
            {isLoading
              ? CURRENT_SKELETON_KEYS.map((key) => (
                  <PriestCardSkeleton key={key} variant="current" />
                ))
              : currentPriests.map((priest) => (
                  <PriestCard key={priest.id} priest={priest} />
                ))}
          </div>
          {!isLoading && currentPriests.length === 0 ? (
            <div className="rounded-[18px] bg-[#f7f7f7] p-8 text-sm text-[#7f7f7f]">
              현재 공개된 신부님 정보가 없습니다.
            </div>
          ) : null}
        </section>

        {isLoading || formerPriests.length > 0 ? (
          <section className="space-y-5">
            <h3 className="text-[18px] font-medium text-[#8a8a8a]">
              이전 신부님
            </h3>
            <div className="grid gap-7 xl:grid-cols-3">
              {isLoading
                ? FORMER_SKELETON_KEYS.map((key) => (
                    <PriestCardSkeleton key={key} variant="former" />
                  ))
                : formerPriests.map((priest) => (
                    <PriestCard key={priest.id} priest={priest} />
                  ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  )
}
