import { GalleryYoutubeBadgeIcon } from "@/components/svgs"
import { cn } from "@/lib/utils"

type GalleryYoutubeBadgeProps = {
  className?: string
  iconClassName?: string
}

export function GalleryYoutubeBadge({
  className,
  iconClassName,
}: GalleryYoutubeBadgeProps) {
  return (
    <span
      className={cn(
        "pointer-events-none inline-flex items-center justify-center rounded-full border border-white/45 bg-white/30 p-0 backdrop-blur-[2px]",
        className,
      )}
    >
      <GalleryYoutubeBadgeIcon
        className={cn(
          "h-7 w-7 -translate-x-[1px] -translate-y-[1px]",
          iconClassName,
        )}
      />
    </span>
  )
}
