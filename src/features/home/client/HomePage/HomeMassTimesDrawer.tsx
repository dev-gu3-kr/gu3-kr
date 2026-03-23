"use client"

import { X } from "lucide-react"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { HomeFooterMassTime } from "@/features/home/isomorphic"

type HomeMassTimesDrawerProps = {
  readonly massTimes: readonly HomeFooterMassTime[]
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

const MOBILE_SHEET_CONTENT_CLASS_NAME =
  "w-[min(300px,calc(100vw-60px))] overflow-y-auto border-l border-neutral-200 bg-white px-0 sm:max-w-[300px]"

export function HomeMassTimesDrawer({
  massTimes,
  open,
  onOpenChange,
}: HomeMassTimesDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
        className={MOBILE_SHEET_CONTENT_CLASS_NAME}
      >
        <SheetHeader className="gap-0 px-[13px] pb-4 pt-4 text-left">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle className="pl-[17px] text-[24px] font-semibold tracking-[-0.02em] text-neutral-900">
              미사시간 안내
            </SheetTitle>
            <SheetClose asChild>
              <button
                type="button"
                aria-label="미사시간 안내 닫기"
                className="grid size-8 place-items-center text-neutral-900"
              >
                <X className="size-7" strokeWidth={2.1} />
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="bg-[#f8f8fb] px-[30px] py-8">
          <div>
            {massTimes.map((massTime, index) => (
              <section
                key={massTime.title}
                className={
                  index === 0 ? "pb-8" : "border-t border-[#e2e2e2] pt-8 pb-2"
                }
              >
                <h3 className="text-[19px] font-semibold leading-none tracking-[-0.02em] text-neutral-900">
                  {massTime.title}
                </h3>

                <div className="mt-8 space-y-6">
                  {(
                    massTime.drawerGroups ??
                    massTime.lines.map((line, lineIndex) => ({
                      label: lineIndex === 0 ? "안내" : "",
                      lines: [line],
                    }))
                  ).map((group) => (
                    <div
                      key={`${massTime.title}-${group.label}`}
                      className="space-y-1"
                    >
                      {group.label ? (
                        <h4 className="text-[18px] font-semibold leading-none tracking-[-0.02em] text-neutral-900">
                          {group.label}
                        </h4>
                      ) : null}
                      <div className="space-y-1 text-[17px] font-normal leading-[1.45] tracking-[-0.02em] text-[#2f3137]">
                        {group.lines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
