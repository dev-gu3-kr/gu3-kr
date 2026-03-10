import Image from "next/image"

import { SubLanding } from "@/components/SubLanding"

export default async function DirectionsPage() {
  return (
    <>
      <SubLanding
        title="오시는 길"
        sectionLabel="구로3동 성당"
        currentLabel="오시는 길"
      />

      <section className="mx-auto w-full max-w-[1220px] px-5 py-10 md:px-8 md:py-14">
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
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-[2px] border border-[#d9d9d9] px-2.5 py-0.5 text-xs font-medium text-[#7b7d83] md:text-sm">
              도로명
            </span>
            <span className="font-semibold">
              서울 구로구 디지털로27길 82 구로3동천주교회
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-[2px] border border-[#d9d9d9] px-2.5 py-0.5 text-xs font-medium text-[#7b7d83] md:text-sm">
              지번
            </span>
            <span className="font-semibold">서울 구로구 구로동 265-1</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-[2px] border border-[#d9d9d9] px-2.5 py-0.5 text-xs font-medium text-[#7b7d83] md:text-sm">
              우편번호
            </span>
            <span className="font-semibold">08375</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#e5e5e5] pt-5">
          <div className="flex items-center gap-2 text-base font-bold text-[#252629]">
            <span className="text-xl">☎</span>
            <span>02-857-8541</span>
          </div>

          <a
            href="https://map.naver.com/p/search/%EA%B5%AC%EB%A1%9C3%EB%8F%99%EC%84%B1%EB%8B%B9"
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
