import { format, formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { CornerDownRight, Loader2, Search } from "lucide-react"

import { AppLink as Link } from "@/components/AppLink"
import { InfiniteSentinel } from "@/components/InfiniteSentinel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type {
  InquiryListItemDto,
  InquiryStatusFilterDto,
  InquiryTypeFilterDto,
} from "@/features/inquiries/isomorphic"

const STATUS_LABEL: Record<Exclude<InquiryStatusFilterDto, "all">, string> = {
  RECEIVED: "접수",
  IN_PROGRESS: "처리중",
  DONE: "완료",
}

const STATUS_BADGE_CLASSNAME: Record<
  Exclude<InquiryStatusFilterDto, "all">,
  string
> = {
  RECEIVED: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-emerald-100 text-emerald-700",
}

const INQUIRY_TYPE_LABEL: Record<InquiryListItemDto["inquiryType"], string> = {
  MASS_SACRAMENT: "미사 및 성사 문의",
  CATECHUMEN_CLASS: "예비신자 / 교리 문의",
  FAITH_PARISH_LIFE: "신앙 및 본당 생활 문의",
  FACILITY_RENTAL: "시설 및 대관 문의",
  WEBSITE_ONLINE: "홈페이지 및 온라인 서비스 문의",
  VOLUNTEER_DONATION: "봉사 및 후원 문의",
  OTHER: "기타 문의",
}

const INQUIRY_TYPE_FILTER_OPTIONS: ReadonlyArray<{
  value: InquiryTypeFilterDto
  label: string
}> = [
  { value: "all", label: "문의 유형 전체" },
  { value: "MASS_SACRAMENT", label: "미사 및 성사 문의" },
  { value: "CATECHUMEN_CLASS", label: "예비신자 / 교리 문의" },
  { value: "FAITH_PARISH_LIFE", label: "신앙 및 본당 생활 문의" },
  { value: "FACILITY_RENTAL", label: "시설 및 대관 문의" },
  { value: "WEBSITE_ONLINE", label: "홈페이지 및 온라인 서비스 문의" },
  { value: "VOLUNTEER_DONATION", label: "봉사 및 후원 문의" },
  { value: "OTHER", label: "기타 문의" },
]

const FILTER_ACTIVE_CLASSNAME: Record<InquiryStatusFilterDto, string> = {
  all: "data-[state=on]:bg-neutral-900 data-[state=on]:text-white",
  RECEIVED: "data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700",
  IN_PROGRESS: "data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700",
  DONE: "data-[state=on]:bg-emerald-100 data-[state=on]:text-emerald-700",
}

type InquiryListViewProps = {
  queryInput: string
  status: InquiryStatusFilterDto
  inquiryType: InquiryTypeFilterDto
  items: InquiryListItemDto[]
  isLoading: boolean
  isError: boolean
  isFilterFetching: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  onQueryInputChange: (value: string) => void
  onStatusChange: (value: InquiryStatusFilterDto) => void
  onInquiryTypeChange: (value: InquiryTypeFilterDto) => void
  onLoadMore: () => Promise<void>
}

export function InquiryListView({
  queryInput,
  status,
  inquiryType,
  items,
  isLoading,
  isError,
  isFilterFetching,
  isFetchingNextPage,
  hasNextPage,
  onQueryInputChange,
  onStatusChange,
  onInquiryTypeChange,
  onLoadMore,
}: InquiryListViewProps) {
  return (
    <div className="space-y-3">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "RECEIVED" ||
                value === "IN_PROGRESS" ||
                value === "DONE"
              ) {
                onStatusChange(value)
              }
            }}
            className="justify-start"
          >
            <ToggleGroupItem
              value="all"
              aria-label="전체"
              className={FILTER_ACTIVE_CLASSNAME.all}
            >
              전체
            </ToggleGroupItem>
            <ToggleGroupItem
              value="RECEIVED"
              aria-label="접수"
              className={FILTER_ACTIVE_CLASSNAME.RECEIVED}
            >
              접수
            </ToggleGroupItem>
            <ToggleGroupItem
              value="IN_PROGRESS"
              aria-label="처리중"
              className={FILTER_ACTIVE_CLASSNAME.IN_PROGRESS}
            >
              처리중
            </ToggleGroupItem>
            <ToggleGroupItem
              value="DONE"
              aria-label="완료"
              className={FILTER_ACTIVE_CLASSNAME.DONE}
            >
              완료
            </ToggleGroupItem>
          </ToggleGroup>

          {isFilterFetching || isFetchingNextPage ? (
            <p className="inline-flex items-center gap-1 text-xs text-neutral-500 sm:hidden">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              불러오는 중
            </p>
          ) : null}
        </div>

        <Select
          value={inquiryType}
          onValueChange={(value) =>
            onInquiryTypeChange(value as InquiryTypeFilterDto)
          }
        >
          <SelectTrigger className="h-9 w-full min-w-[190px] rounded-md border text-sm sm:w-[220px]">
            <SelectValue placeholder="문의 유형 전체" />
          </SelectTrigger>
          <SelectContent>
            {INQUIRY_TYPE_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative sm:max-w-sm sm:flex-1">
          <input
            value={queryInput}
            onChange={(event) => onQueryInputChange(event.target.value)}
            placeholder="검색"
            className="w-full rounded-md border px-3 py-2 pr-10 text-sm"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>

        {isFilterFetching || isFetchingNextPage ? (
          <p className="hidden items-center gap-1 text-xs text-neutral-500 sm:inline-flex">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            불러오는 중
          </p>
        ) : null}
      </section>

      {isLoading && items.length === 0 ? (
        <div className="space-y-2">
          {["sk-1", "sk-2", "sk-3"].map((key) => (
            <div key={key} className="animate-pulse rounded-md border p-4">
              <div className="h-5 w-3/5 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-4/5 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-32 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : null}

      {isError && items.length === 0 ? (
        <p className="text-sm text-red-600">문의 목록을 불러오지 못했습니다.</p>
      ) : null}

      <div
        className={
          isFilterFetching
            ? "pointer-events-none relative space-y-2 opacity-60"
            : "relative space-y-2"
        }
      >
        {items.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-neutral-500">
            검색 결과가 없습니다.
          </div>
        ) : (
          items.map((inquiry) => (
            <Link
              key={inquiry.id}
              href={`/admin/inquiries/${inquiry.id}`}
              className="block rounded-md border p-4 transition-colors hover:bg-neutral-50"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">
                  {INQUIRY_TYPE_LABEL[inquiry.inquiryType]}
                </p>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSNAME[inquiry.status]}`}
                >
                  {STATUS_LABEL[inquiry.status]}
                </span>
              </div>

              <p className="mt-1 truncate text-sm text-neutral-600">
                {inquiry.summary}
              </p>

              <p className="mt-2 text-xs text-neutral-500">
                {format(new Date(inquiry.createdAt), "yyyy.MM.dd HH:mm")} ·{" "}
                {formatDistanceToNow(new Date(inquiry.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>

              {inquiry.processingMemo?.trim() ? (
                <div className="mt-2 flex items-start gap-1.5 rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                  <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>처리메모: {inquiry.processingMemo}</span>
                </div>
              ) : null}
            </Link>
          ))
        )}

        <InfiniteSentinel
          hasMore={Boolean(hasNextPage)}
          onLoadMore={onLoadMore}
          disabled={isFetchingNextPage}
        />
      </div>
    </div>
  )
}
