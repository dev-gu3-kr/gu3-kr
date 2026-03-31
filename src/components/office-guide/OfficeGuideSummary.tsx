import Image from "next/image"

import { OFFICE_GUIDE_SUMMARY_LINES } from "./officeGuide.data"

type OfficeGuideSummaryProps = {
  readonly showHeading?: boolean
}

export function OfficeGuideSummary({
  showHeading = false,
}: OfficeGuideSummaryProps) {
  return (
    <div className="space-y-3">
      {showHeading ? (
        <p className="text-base font-bold text-[#b1232a]">• 사무실 안내</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[178px_minmax(0,1fr)] md:items-start md:gap-[30px]">
        <div className="relative aspect-[178/126] w-full max-w-[320px] overflow-hidden rounded-[10px] bg-[#efefef] md:max-w-[178px]">
          <Image
            src="/images/parish/parish-facilities-office.webp"
            alt="사무실 안내 이미지"
            fill
            sizes="(max-width: 767px) min(100vw - 40px, 320px), 178px"
            className="object-cover"
          />
        </div>

        <div className="space-y-1.5 text-[15px] font-medium text-[#252629] md:text-[16px]">
          <p className="text-base font-bold leading-6 text-[#252629]">
            사무실 업무시간
          </p>

          <div className="space-y-0 text-[15px] leading-6 md:text-[16px] md:leading-6">
            {OFFICE_GUIDE_SUMMARY_LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
