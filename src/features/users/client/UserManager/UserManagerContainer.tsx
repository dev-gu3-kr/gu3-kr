"use client"

import type { UserRole } from "@prisma/client"
import { useCallback, useEffect, useState } from "react"
import type { AdminUserListItemDto } from "@/features/users/isomorphic"
import { apiFetch } from "@/lib/api"

type UserListResponse = {
  ok?: boolean
  items?: AdminUserListItemDto[]
  message?: string
}

const roleOptions: UserRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"]

export function UserManagerContainer() {
  const [items, setItems] = useState<AdminUserListItemDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("EDITOR")

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const response = await apiFetch.get("/api/admin/users").send()
      const json = (await response
        .json()
        .catch(() => null)) as UserListResponse | null
      if (!response.ok || !json?.ok || !Array.isArray(json.items))
        throw new Error(json?.message ?? "사용자 목록을 불러오지 못했습니다.")
      setItems(json.items)
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "오류가 발생했습니다.",
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  async function handleCreate() {
    setMessage(null)
    const response = await apiFetch
      .post("/api/admin/users")
      .json({
        username,
        displayName,
        email: email || undefined,
        password,
        role,
        isActive: true,
      })
      .send()

    const json = (await response.json().catch(() => null)) as {
      ok?: boolean
      message?: string
    } | null
    if (!response.ok || !json?.ok) {
      setMessage(json?.message ?? "사용자 등록에 실패했습니다.")
      return
    }

    setUsername("")
    setDisplayName("")
    setEmail("")
    setPassword("")
    setRole("EDITOR")
    await loadUsers()
  }

  async function handleDelete(id: string) {
    if (!window.confirm("정말 삭제하시겠습니까?")) return
    const response = await apiFetch.del(`/api/admin/users/${id}`).send()
    const json = (await response.json().catch(() => null)) as {
      ok?: boolean
      message?: string
    } | null
    if (!response.ok || !json?.ok) {
      setMessage(json?.message ?? "삭제에 실패했습니다.")
      return
    }
    await loadUsers()
  }

  async function handleResetPassword(id: string) {
    const next = window.prompt("새 비밀번호를 입력하세요(8자 이상).")
    if (!next) return
    const response = await apiFetch
      .patch(`/api/admin/users/${id}`)
      .json({ resetPassword: next })
      .send()
    const json = (await response.json().catch(() => null)) as {
      ok?: boolean
      message?: string
    } | null
    if (!response.ok || !json?.ok) {
      setMessage(json?.message ?? "비밀번호 초기화에 실패했습니다.")
      return
    }
    setMessage("비밀번호를 초기화했습니다.")
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">사용자 등록</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="로그인 ID"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="표시 이름"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일(선택)"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="초기 비밀번호"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="rounded-md border px-3 py-2 text-sm sm:col-span-2"
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => void handleCreate()}
          className="rounded-md bg-black px-3 py-2 text-sm text-white"
        >
          등록
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">사용자 목록</h2>
        {isLoading ? (
          <p className="text-sm text-neutral-500">불러오는 중...</p>
        ) : null}
        {message ? <p className="text-sm text-neutral-600">{message}</p> : null}
        {!isLoading && items.length === 0 ? (
          <p className="rounded-md border p-4 text-sm text-neutral-500">
            등록된 사용자가 없습니다.
          </p>
        ) : null}

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-md border p-3 text-sm">
              <p className="font-medium">
                {item.displayName}{" "}
                <span className="text-neutral-500">({item.username})</span>
              </p>
              <p className="text-neutral-600">
                {item.email ?? "이메일 없음"} · {item.role} ·{" "}
                {item.isActive ? "활성" : "비활성"}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleResetPassword(item.id)}
                  className="rounded-md border px-2 py-1 text-xs"
                >
                  비밀번호 초기화
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
