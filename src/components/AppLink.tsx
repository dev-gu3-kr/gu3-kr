import Link, { type LinkProps } from "next/link"
import { type AnchorHTMLAttributes, forwardRef } from "react"

type AppLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    prefetch?: boolean
  }

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ prefetch = false, ...props }, ref) => {
    return <Link ref={ref} prefetch={prefetch} {...props} />
  },
)

AppLink.displayName = "AppLink"
