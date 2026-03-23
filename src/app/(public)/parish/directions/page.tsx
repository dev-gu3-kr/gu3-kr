import { MapPin } from "lucide-react"
import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"
import { OfficePhoneIcon } from "@/components/svgs"

const NAVER_MAP_URL =
  "https://map.naver.com/p/search/%EA%B5%AC%EB%A1%9C3%EB%8F%99%EC%84%B1%EB%8B%B9"

const ADDRESS_ITEMS = [
  {
    label: "도로명",
    value: "서울 구로구 디지털로27길 82 구로3동천주교회",
  },
  {
    label: "지번",
    value: "서울 구로구 구로동 265-1",
  },
  {
    label: "우편번호",
    value: "08375",
  },
] as const

export default async function DirectionsPage() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="구로3동 성당"
        currentLabel="오시는 길"
      />

      <section className="mx-auto w-full max-w-[1220px] px-5 py-5 md:hidden">
        <h2 className="text-[22px] font-bold text-[#252629]">오시는 길</h2>

        <div className="relative mt-6 aspect-[348/260] w-full overflow-hidden border border-[#d9d9d9] bg-[#f2f2f2]">
          <Image
            src="/images/parish/directions-map-mobile.webp"
            alt="구로3동 성당 위치 지도"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={NAVER_MAP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[50px] items-center gap-3 rounded-full border border-[#d6d8de] bg-white px-5 text-[16px] font-medium text-[#252629] transition-colors hover:bg-[#f7f7f7]"
          >
            <Image
              src="/images/parish/naver-map-icon.webp"
              alt="네이버 지도 아이콘"
              width={28}
              height={28}
              className="size-7"
            />
            <span>네이버 지도로 보기</span>
          </a>
        </div>

        <div className="mt-9">
          <div className="flex items-center gap-3 text-[#252629]">
            <MapPin className="size-8 shrink-0" strokeWidth={2.4} />
            <h3 className="text-[22px] font-bold tracking-[-0.02em]">
              구로3동 성당
            </h3>
          </div>

          <div className="mt-6 space-y-5 text-[#252629]">
            <div>
              <span className="inline-flex rounded-[2px] border border-[#d9d9d9] px-3 py-1 text-[15px] font-medium text-[#7b7d83]">
                도로명
              </span>
              <p className="mt-4 text-[18px] font-semibold leading-[1.45] tracking-[-0.02em]">
                서울 구로구 디지털로27길 82 구로3동천주교회
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2dd] px-3 py-1.5 text-[15px] font-medium text-[#697215]">
              <span className="grid size-5 place-items-center rounded-full bg-[#697215] text-[11px] font-semibold text-white">
                N
              </span>
              <span>남구로역 2번 출구에서 264m</span>
            </div>

            <div className="flex items-start gap-4">
              <span className="inline-flex shrink-0 rounded-[2px] border border-[#d9d9d9] px-3 py-1 text-[15px] font-medium text-[#7b7d83]">
                지번
              </span>
              <p className="pt-1 text-[18px] font-semibold leading-[1.45] tracking-[-0.02em]">
                서울 구로구 구로동 265-1
              </p>
            </div>

            <div className="flex items-start gap-4">
              <span className="inline-flex shrink-0 rounded-[2px] border border-[#d9d9d9] px-3 py-1 text-[15px] font-medium text-[#7b7d83]">
                우편번호
              </span>
              <p className="pt-1 text-[18px] font-semibold leading-[1.45] tracking-[-0.02em]">
                08375
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-3 text-[#252629]">
            <OfficePhoneIcon className="h-8 w-8 shrink-0" aria-hidden />
            <h3 className="text-[22px] font-bold tracking-[-0.02em]">연락처</h3>
          </div>

          <p className="mt-6 text-[20px] font-semibold tracking-[-0.02em] text-[#252629]">
            02-857-8541
          </p>
        </div>
      </section>

      <section className="mx-auto hidden w-full max-w-[1220px] px-5 py-5 md:block md:px-8 md:py-14">
        <h2 className="text-[22px] font-bold text-[#252629]">오시는 길</h2>

        <div className="relative mt-6 aspect-[1220/480] w-full overflow-hidden border border-[#d9d9d9] bg-[#f2f2f2]">
          <Image
            src="/images/parish/directions-map-v2.webp"
            alt="구로3동 성당 위치 지도"
            fill
            sizes="(max-width: 1280px) 100vw, 1220px"
            className="object-cover"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-5 text-base font-bold text-[#252629]">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <span>구로3동 성당</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2dd] px-2.5 py-1 text-sm font-medium text-[#697215]">
            <span className="grid size-4 place-items-center rounded-full bg-[#697215] text-[10px] text-white">
              N
            </span>
            <span>남구로역 2번 출구에서 264m</span>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm text-[#252629] md:text-base">
          {ADDRESS_ITEMS.map((item) => (
            <div key={item.label} className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-[2px] border border-[#d9d9d9] px-2.5 py-0.5 text-xs font-medium text-[#7b7d83] md:text-sm">
                {item.label}
              </span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#e5e5e5] pt-5">
          <div className="flex items-center gap-2 text-base font-bold text-[#252629]">
            <span className="text-xl">☎</span>
            <span>02-857-8541</span>
          </div>

          <a
            href={NAVER_MAP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#d9d9d9] px-4 py-2 text-sm font-medium text-[#252629] transition-colors hover:bg-[#f7f7f7]"
          >
            <Image
              src="/images/parish/naver-map-icon.webp"
              alt="네이버 지도 아이콘"
              width={20}
              height={20}
              className="size-5"
            />
            <span>네이버 지도로 보기</span>
          </a>
        </div>
      </section>
    </>
  )
}
