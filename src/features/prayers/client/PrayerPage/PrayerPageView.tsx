import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type {
  PrayerEntry,
  PrayerLine,
  PrayerLineSegment,
  PrayerTabId,
} from "./prayer.data"

type PrayerPageViewProps = {
  activeTab: PrayerTabId
  tabs: Array<{
    id: PrayerTabId
    label: string
  }>
  entries: PrayerEntry[]
  onTabChange: (tabId: PrayerTabId) => void
}

function renderPrayerLine(line: PrayerLine) {
  if (typeof line === "string") {
    return line
  }

  return line.map((segment: PrayerLineSegment) => (
    <span
      key={`${segment.text}-${segment.color ?? "default"}-${segment.bold ? "b" : "n"}-${segment.underline ? "u" : "n"}`}
      className={cn(
        segment.bold && "font-semibold",
        segment.underline && "underline underline-offset-2",
        segment.color === "accent" && "text-[#e14a43]",
      )}
    >
      {segment.text}
    </span>
  ))
}

function PrayerCard({ entry }: { readonly entry: PrayerEntry }) {
  return (
    <article className="space-y-6">
      <h3 className="text-[24px] font-semibold tracking-[-0.03em] text-[#252629] md:text-[26px]">
        {entry.title}
      </h3>

      <div className="space-y-10 bg-[#f7f7f7] px-8 py-8 md:px-10 md:py-10">
        {entry.sections.map((section, sectionIndex) => (
          <section
            key={`${entry.id}-${section.heading ?? "body"}-${sectionIndex}`}
            className="space-y-1"
          >
            <div className="space-y-1">
              {section.lines.map((line, lineIndex) => (
                <p
                  key={`${entry.id}-${section.heading ?? "body"}-${sectionIndex}-${lineIndex}`}
                  className={cn(
                    "whitespace-pre-line text-[15px] font-medium leading-9 text-[#444] md:text-[16px]",
                    typeof line === "string" &&
                      (line === "아멘." || line === "◎ 아멘.") &&
                      "font-semibold text-[#333]",
                  )}
                >
                  {renderPrayerLine(line)}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}

export function PrayerPageView(props: PrayerPageViewProps) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
      <div>
        <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#252629] md:text-[34px]">
          기도문
        </h2>
      </div>

      <nav
        className="mt-8 flex flex-wrap gap-2.5 md:gap-2.5 lg:gap-4"
        aria-label="기도문 탭"
      >
        {props.tabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            onClick={() => props.onTabChange(tab.id)}
            variant="outline"
            className={cn(
              "min-h-9 rounded-full px-3.5 py-1 text-[14px] font-semibold shadow-none transition-all duration-150 hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(37,38,41,0.08)] focus-visible:ring-[#e85a5e]/30 md:min-h-[42px] md:px-4 md:py-2 md:text-[14px] lg:min-h-[48px] lg:px-6 lg:py-2.5 lg:text-[15px]",
              props.activeTab === tab.id
                ? "border-[#e85a5e] bg-white text-[#cf2e33] hover:border-[#e85a5e] hover:bg-white hover:text-[#cf2e33]"
                : "border-[#d8d8d8] bg-white text-[#333] hover:border-[#c7c7c7] hover:bg-[#fcfcfc] hover:text-[#252629]",
            )}
            aria-pressed={props.activeTab === tab.id}
          >
            {tab.label}
          </Button>
        ))}
      </nav>

      <div className="mt-10 space-y-12">
        {props.entries.length === 0 ? (
          <div className="bg-[#f7f7f7] px-6 py-10 text-center text-sm text-[#6f6761]">
            선택한 탭에 표시할 기도문이 없습니다.
          </div>
        ) : (
          props.entries.map((entry) => (
            <PrayerCard key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </section>
  )
}
