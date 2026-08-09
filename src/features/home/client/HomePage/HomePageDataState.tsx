import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const SCHEDULER_SKELETON_DAYS = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const
const EVENT_SKELETON_CARDS = [
  "event-1",
  "event-2",
  "event-3",
  "event-4",
] as const
const BOARD_SKELETON_COLUMNS = ["notice", "youth", "bulletin"] as const
const BOARD_SKELETON_ROWS = [
  "row-1",
  "row-2",
  "row-3",
  "row-4",
  "row-5",
] as const

export function HomePageDataLoadingState() {
  return (
    <div aria-busy="true">
      <output aria-live="polite" className="sr-only">
        홈 화면 소식을 불러오는 중
      </output>
      <section className="bg-white px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1220px]">
          <Skeleton className="mx-auto h-8 w-40" />
          <div className="mt-8 grid grid-cols-7 gap-2 md:gap-4">
            {SCHEDULER_SKELETON_DAYS.map((day) => (
              <Skeleton key={day} className="h-20 rounded-xl md:h-28" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1220px]">
          <Skeleton className="mx-auto h-9 w-44" />
          <Skeleton className="mx-auto mt-3 h-5 w-64 max-w-full" />
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {EVENT_SKELETON_CARDS.map((card) => (
              <Skeleton
                key={card}
                className="h-[150px] rounded-[20px] md:h-[180px]"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1220px]">
          <Skeleton className="mx-auto h-9 w-40" />
          <Skeleton className="mx-auto mt-3 h-5 w-56 max-w-full" />
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {BOARD_SKELETON_COLUMNS.map((column) => (
              <div key={column}>
                <div className="mb-4 flex justify-between border-b pb-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-10" />
                </div>
                <div className="space-y-3">
                  {BOARD_SKELETON_ROWS.map((row) => (
                    <div key={row} className="flex justify-between gap-4">
                      <Skeleton className="h-5 min-w-0 flex-1" />
                      <Skeleton className="h-5 w-16 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export function HomePageDataErrorState({
  onRetry,
}: {
  readonly onRetry: () => void
}) {
  return (
    <section
      className="bg-white px-5 py-24 text-center md:px-8 md:py-32"
      role="alert"
    >
      <div className="mx-auto max-w-md rounded-2xl border bg-muted/20 px-6 py-10">
        <h2 className="text-xl font-semibold">
          홈 화면 소식을 불러오지 못했습니다.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          잠시 후 다시 시도해 주세요.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={onRetry}
        >
          다시 불러오기
        </Button>
      </div>
    </section>
  )
}
