"use client"

import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = React.ComponentProps<"div"> & {
  readonly opts?: CarouselOptions
  readonly plugins?: CarouselPlugin
  readonly orientation?: "horizontal" | "vertical"
  readonly setApi?: (api: CarouselApi) => void
}

type CarouselContextValue = {
  readonly carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  readonly api: CarouselApi
  readonly orientation: "horizontal" | "vertical"
  readonly scrollPrev: () => void
  readonly scrollNext: () => void
  readonly canScrollPrev: boolean
  readonly canScrollNext: boolean
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) {
      return
    }

    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  React.useEffect(() => {
    if (!api || !setApi) {
      return
    }

    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) {
      return
    }

    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        api,
        canScrollNext,
        canScrollPrev,
        carouselRef,
        orientation,
        scrollNext,
        scrollPrev,
      }}
    >
      <section
        data-slot="carousel"
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { canScrollPrev, orientation, scrollPrev } = useCarousel()

  return (
    <button
      type="button"
      data-slot="carousel-previous"
      className={cn(
        "absolute flex size-8 items-center justify-center rounded-full border border-black/10 bg-white text-[#252629] shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      {children ?? <ArrowLeft className="size-4" />}
      <span className="sr-only">Previous slide</span>
    </button>
  )
}

function CarouselNext({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { canScrollNext, orientation, scrollNext } = useCarousel()

  return (
    <button
      type="button"
      data-slot="carousel-next"
      className={cn(
        "absolute flex size-8 items-center justify-center rounded-full border border-black/10 bg-white text-[#252629] shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      {children ?? <ArrowRight className="size-4" />}
      <span className="sr-only">Next slide</span>
    </button>
  )
}

export type { CarouselApi, CarouselOptions }
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
}
