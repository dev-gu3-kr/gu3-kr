import type { AdminMenuPermission } from "@/features/admin/isomorphic"

type AdminAccessRequirement =
  | { type: "authenticated" }
  | { type: "super-admin" }
  | { type: "menu"; anyOf: readonly AdminMenuPermission[] }

type AdminPathRule = {
  prefix: string
  requirement: AdminAccessRequirement
}

const PAGE_RULES: readonly AdminPathRule[] = [
  {
    prefix: "/admin/notices",
    requirement: { type: "menu", anyOf: ["NOTICES"] },
  },
  {
    prefix: "/admin/clergy/priests",
    requirement: { type: "menu", anyOf: ["PRIESTS"] },
  },
  {
    prefix: "/admin/clergy/nuns",
    requirement: { type: "menu", anyOf: ["NUNS"] },
  },
  {
    prefix: "/admin/bulletins",
    requirement: { type: "menu", anyOf: ["BULLETINS"] },
  },
  { prefix: "/admin/events", requirement: { type: "menu", anyOf: ["EVENTS"] } },
  {
    prefix: "/admin/gallery",
    requirement: { type: "menu", anyOf: ["GALLERY"] },
  },
  {
    prefix: "/admin/community/about",
    requirement: { type: "menu", anyOf: ["COMMUNITY_ABOUT"] },
  },
  {
    prefix: "/admin/pastoral-council",
    requirement: { type: "menu", anyOf: ["PASTORAL_COUNCIL"] },
  },
  {
    prefix: "/admin/youth/about",
    requirement: { type: "menu", anyOf: ["YOUTH_ABOUT"] },
  },
  {
    prefix: "/admin/youth-blog",
    requirement: { type: "menu", anyOf: ["YOUTH_BLOG"] },
  },
  {
    prefix: "/admin/inquiries",
    requirement: { type: "menu", anyOf: ["INQUIRIES"] },
  },
  { prefix: "/admin/users", requirement: { type: "super-admin" } },
]

const API_RULES: readonly AdminPathRule[] = [
  {
    prefix: "/api/admin/notices",
    requirement: { type: "menu", anyOf: ["NOTICES"] },
  },
  {
    prefix: "/api/admin/clergy/priests",
    requirement: { type: "menu", anyOf: ["PRIESTS"] },
  },
  {
    prefix: "/api/admin/clergy/nuns",
    requirement: { type: "menu", anyOf: ["NUNS"] },
  },
  {
    prefix: "/api/admin/bulletins",
    requirement: { type: "menu", anyOf: ["BULLETINS"] },
  },
  {
    prefix: "/api/admin/events",
    requirement: { type: "menu", anyOf: ["EVENTS"] },
  },
  {
    prefix: "/api/admin/gallery",
    requirement: { type: "menu", anyOf: ["GALLERY"] },
  },
  {
    prefix: "/api/admin/community/about",
    requirement: { type: "menu", anyOf: ["COMMUNITY_ABOUT"] },
  },
  {
    prefix: "/api/admin/pastoral-council",
    requirement: { type: "menu", anyOf: ["PASTORAL_COUNCIL"] },
  },
  {
    prefix: "/api/admin/youth/about",
    requirement: { type: "menu", anyOf: ["YOUTH_ABOUT"] },
  },
  {
    prefix: "/api/admin/youth-blog",
    requirement: { type: "menu", anyOf: ["YOUTH_BLOG"] },
  },
  {
    prefix: "/api/admin/inquiries",
    requirement: { type: "menu", anyOf: ["INQUIRIES"] },
  },
  {
    prefix: "/api/admin/uploads/clergy-image",
    requirement: {
      type: "menu",
      anyOf: ["PRIESTS", "NUNS", "PASTORAL_COUNCIL"],
    },
  },
  {
    prefix: "/api/admin/uploads/gallery-image",
    requirement: { type: "menu", anyOf: ["GALLERY"] },
  },
  {
    prefix: "/api/admin/uploads/intro-image",
    requirement: { type: "menu", anyOf: ["COMMUNITY_ABOUT", "YOUTH_ABOUT"] },
  },
  {
    prefix: "/api/admin/uploads/notice-image",
    requirement: { type: "menu", anyOf: ["NOTICES"] },
  },
  {
    prefix: "/api/admin/uploads/youth-blog-image",
    requirement: { type: "menu", anyOf: ["YOUTH_BLOG"] },
  },
  { prefix: "/api/admin/users", requirement: { type: "super-admin" } },
  { prefix: "/api/admin/session", requirement: { type: "authenticated" } },
]

function matchesPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

// 등록되지 않은 신규 관리자 경로는 최고관리자만 허용해 권한 누락을 안전하게 막는다.
export function getAdminAccessRequirement(
  pathname: string,
): AdminAccessRequirement {
  if (pathname === "/admin") return { type: "authenticated" }

  const rules = pathname.startsWith("/api/admin") ? API_RULES : PAGE_RULES
  return (
    rules.find((rule) => matchesPathPrefix(pathname, rule.prefix))
      ?.requirement ?? { type: "super-admin" }
  )
}

export function canAccessAdminPath(
  pathname: string,
  role: string,
  permissions: readonly AdminMenuPermission[],
) {
  if (role === "SUPER_ADMIN") return true

  const requirement = getAdminAccessRequirement(pathname)
  if (requirement.type === "authenticated") return true
  if (requirement.type === "super-admin") return false

  const allowed = new Set(permissions)
  return requirement.anyOf.some((permission) => allowed.has(permission))
}
