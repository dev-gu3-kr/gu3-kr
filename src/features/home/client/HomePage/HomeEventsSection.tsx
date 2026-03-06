"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import * as React from "react"

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { HomeEventCard } from "@/features/home/isomorphic"
import { cn } from "@/lib/utils"

type HomeEventsSectionProps = {
  readonly cards: readonly HomeEventCard[]
}

export function HomeEventsSection({ cards }: HomeEventsSectionProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [snapCount, setSnapCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    const syncState = () => {
      setSelectedIndex(api.selectedScrollSnap())
      setSnapCount(api.scrollSnapList().length)
    }

    syncState()
    api.on("select", syncState)
    api.on("reInit", syncState)

    return () => {
      api.off("select", syncState)
      api.off("reInit", syncState)
    }
  }, [api])

  return (
    <section className="bg-white px-5 py-20 md:px-8">
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold text-[#252629]">
            본당 행사 안내
          </h2>
          <p className="mt-3 text-sm text-[#6d6f74]">
            본당의 다양한 행사에 참여해 보세요.
          </p>
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <div className="flex items-center gap-4">
            <CarouselPrevious className="static hidden size-11 shrink-0 translate-y-0 rounded-full bg-[#eaebef] text-[#7f848c] md:flex">
              <ChevronLeft className="size-5" />
            </CarouselPrevious>

            <div className="min-w-0 flex-1">
              <CarouselContent className="-ml-6">
                {cards.map((card) => (
                  <CarouselItem
                    key={card.title}
                    className="pl-6 md:basis-1/2 xl:basis-1/4"
                  >
                    <article
                      className={`group overflow-hidden rounded-[20px] bg-gradient-to-br ${card.accentClassName} p-[1px] shadow-[0_16px_28px_rgba(0,0,0,0.12)]`}
                    >
                      <div className="relative h-[210px] overflow-hidden rounded-[19px]">
                        {card.thumbnailUrl ? (
                          <Image
                            src={card.thumbnailUrl}
                            alt={card.title}
                            fill
                            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(17,18,20,0.28)_58%,rgba(17,18,20,0.56))]" />
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <h3
                            className="overflow-hidden text-2xl font-semibold text-white"
                            style={{
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 2,
                              display: "-webkit-box",
                            }}
                          >
                            {card.title}
                          </h3>
                        </div>
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </div>

            <CarouselNext className="static hidden size-11 shrink-0 translate-y-0 rounded-full border-0 bg-[#252629] text-white md:flex">
              <ChevronRight className="size-5" />
            </CarouselNext>
          </div>
        </Carousel>

        <div className="mt-8 flex justify-center gap-3">
          {Array.from(
            { length: snapCount || 1 },
            (_, index) => `snap-${index}`,
          ).map((snapId, index) => (
            <button
              key={snapId}
              type="button"
              className={cn(
                "rounded-full transition-all",
                index === selectedIndex
                  ? "h-3 w-10 bg-[#bd2125]"
                  : "size-3 bg-[#d9d9d9]",
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to event slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
