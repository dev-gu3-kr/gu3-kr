"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import * as React from "react"
import { AppLink as Link } from "@/components/AppLink"
import { GalleryYoutubeBadge } from "@/components/GalleryYoutubeBadge"
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

function chunkCards(cards: readonly HomeEventCard[], size: number) {
  const chunks: HomeEventCard[][] = []

  for (let index = 0; index < cards.length; index += size) {
    chunks.push([...cards.slice(index, index + size)])
  }

  return chunks
}

type EventCardTileProps = {
  readonly card: HomeEventCard
  readonly compact?: boolean
}

function EventCardTile({ card, compact = false }: EventCardTileProps) {
  const content = (
    <article
      className={`group overflow-hidden rounded-[20px] bg-gradient-to-br ${card.accentClassName} p-[1px] shadow-[0_16px_28px_rgba(0,0,0,0.12)]`}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[19px]",
          compact ? "h-[150px]" : "h-[180px] xl:h-[210px]",
        )}
      >
        {card.thumbnailUrl ? (
          <Image
            src={card.thumbnailUrl}
            alt={card.title}
            fill
            sizes={
              compact
                ? "(min-width: 768px) 50vw, 50vw"
                : "(min-width: 768px) 25vw, 100vw"
            }
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(17,18,20,0.28)_58%,rgba(17,18,20,0.56))]" />

        {card.hasYoutube ? (
          <GalleryYoutubeBadge
            className={cn("absolute bottom-2 right-2", compact && "scale-90")}
          />
        ) : null}

        <div
          className={cn(
            "absolute inset-x-0 bottom-0",
            compact ? "p-4" : "p-4 xl:p-6",
          )}
        >
          <h3
            className={cn(
              "overflow-hidden font-semibold text-white",
              compact
                ? "text-lg leading-tight"
                : "text-lg leading-tight xl:text-2xl",
            )}
            style={{
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: compact ? 2 : 2,
              display: "-webkit-box",
            }}
          >
            {card.title}
          </h3>
        </div>
      </div>
    </article>
  )

  if (!card.href) {
    return content
  }

  return (
    <Link
      href={card.href}
      className="block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd2125] focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  )
}

export function HomeEventsSection({ cards }: HomeEventsSectionProps) {
  const mobileCardGroups = React.useMemo(() => chunkCards(cards, 4), [cards])
  const [mobileApi, setMobileApi] = React.useState<CarouselApi>()
  const [mobileSelectedIndex, setMobileSelectedIndex] = React.useState(0)
  const [mobileSnapCount, setMobileSnapCount] = React.useState(0)
  const [desktopApi, setDesktopApi] = React.useState<CarouselApi>()
  const [desktopSelectedIndex, setDesktopSelectedIndex] = React.useState(0)
  const [desktopSnapCount, setDesktopSnapCount] = React.useState(0)

  React.useEffect(() => {
    if (!mobileApi) {
      return
    }

    const syncState = () => {
      setMobileSelectedIndex(mobileApi.selectedScrollSnap())
      setMobileSnapCount(mobileApi.scrollSnapList().length)
    }

    syncState()
    mobileApi.on("select", syncState)
    mobileApi.on("reInit", syncState)

    return () => {
      mobileApi.off("select", syncState)
      mobileApi.off("reInit", syncState)
    }
  }, [mobileApi])

  React.useEffect(() => {
    if (!desktopApi) {
      return
    }

    const syncState = () => {
      setDesktopSelectedIndex(desktopApi.selectedScrollSnap())
      setDesktopSnapCount(desktopApi.scrollSnapList().length)
    }

    syncState()
    desktopApi.on("select", syncState)
    desktopApi.on("reInit", syncState)

    return () => {
      desktopApi.off("select", syncState)
      desktopApi.off("reInit", syncState)
    }
  }, [desktopApi])

  return (
    <section className="bg-white px-5 pb-10 pt-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-10 text-center md:mb-12">
          <h2 className="text-3xl font-semibold text-[#252629]">
            본당 행사 안내
          </h2>
          <p className="mt-3 text-sm text-[#6d6f74]">
            본당의 다양한 행사에 참여해 보세요.
          </p>
        </div>

        <div className="md:hidden">
          <Carousel
            setApi={setMobileApi}
            opts={{
              align: "start",
              containScroll: "trimSnaps",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {mobileCardGroups.map((group) => (
                <CarouselItem
                  key={group.map((card) => card.title).join("|")}
                  className="basis-full pl-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {group.map((card) => (
                      <EventCardTile key={card.title} card={card} compact />
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {mobileSnapCount > 1 ? (
            <div className="mt-6 flex justify-center gap-3 md:mt-8">
              {Array.from(
                { length: mobileSnapCount },
                (_, index) => `mobile-snap-${index}`,
              ).map((snapId, index) => (
                <button
                  key={snapId}
                  type="button"
                  className={cn(
                    "rounded-full transition-all",
                    index === mobileSelectedIndex
                      ? "h-3 w-10 bg-[#bd2125]"
                      : "size-3 bg-[#d9d9d9]",
                  )}
                  onClick={() => mobileApi?.scrollTo(index)}
                  aria-label={`Go to mobile event slide ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="hidden md:block">
          <Carousel
            setApi={setDesktopApi}
            opts={{
              align: "start",
              containScroll: "trimSnaps",
            }}
            className="w-full"
          >
            <div className="flex items-center gap-4">
              <CarouselPrevious className="static hidden size-11 shrink-0 translate-y-0 cursor-pointer rounded-full bg-[#eaebef] text-[#7f848c] transition-colors hover:bg-[#dfe2e8] disabled:cursor-not-allowed md:flex">
                <ChevronLeft className="size-5" />
              </CarouselPrevious>

              <div className="min-w-0 flex-1">
                <CarouselContent className="-ml-6">
                  {cards.map((card) => (
                    <CarouselItem
                      key={card.title}
                      className="pl-6 md:basis-1/4"
                    >
                      <EventCardTile card={card} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>

              <CarouselNext className="static hidden size-11 shrink-0 translate-y-0 cursor-pointer rounded-full border-0 bg-[#252629] text-white transition-colors hover:bg-[#111317] disabled:cursor-not-allowed md:flex">
                <ChevronRight className="size-5" />
              </CarouselNext>
            </div>
          </Carousel>

          <div className="mt-8 flex justify-center gap-3">
            {Array.from(
              { length: desktopSnapCount || 1 },
              (_, index) => `desktop-snap-${index}`,
            ).map((snapId, index) => (
              <button
                key={snapId}
                type="button"
                className={cn(
                  "rounded-full transition-all",
                  index === desktopSelectedIndex
                    ? "h-3 w-10 bg-[#bd2125]"
                    : "size-3 bg-[#d9d9d9]",
                )}
                onClick={() => desktopApi?.scrollTo(index)}
                aria-label={`Go to event slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
