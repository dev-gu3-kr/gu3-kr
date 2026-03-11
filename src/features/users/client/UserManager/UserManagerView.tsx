import type { UserRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminUserListItemDto } from "@/features/users/isomorphic"

type UserManagerViewProps = {
  items: AdminUserListItemDto[]
  isLoading: boolean
  message: string | null
  isCreateModalOpen: boolean
  displayName: string
  email: string
  password: string
  role: UserRole
  roleOptions: UserRole[]
  deletingUserId: string | null
  resettingUserId: string | null
  onCreateModalOpenChange: (open: boolean) => void
  onDisplayNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onRoleChange: (value: UserRole) => void
  onCreate: () => Promise<void>
  onDelete: (id: string) => Promise<void>
  onResetPassword: (id: string) => Promise<void>
}

export function UserManagerView({
  items,
  isLoading,
  message,
  isCreateModalOpen,
  displayName,
  email,
  password,
  role,
  roleOptions,
  deletingUserId,
  resettingUserId,
  onCreateModalOpenChange,
  onDisplayNameChange,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
  onCreate,
  onDelete,
  onResetPassword,
}: UserManagerViewProps) {
  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <h2 className="font-medium">사용자 목록</h2>
        <Button
          type="button"
          onClick={() => onCreateModalOpenChange(true)}
          className="bg-black text-white hover:bg-black/90"
        >
          + 사용자 등록
        </Button>
      </section>

      {isLoading ? (
        <p className="text-sm text-neutral-500">불러오는 중...</p>
      ) : null}
      {message ? <p className="text-sm text-neutral-600">{message}</p> : null}

      {!isLoading && items.length === 0 ? (
        <p className="rounded-md border p-4 text-sm text-neutral-500">
          등록된 사용자가 없습니다.
        </p>
      ) : null}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border p-3 text-sm">
            <p className="font-medium">{item.displayName}</p>
            <p className="text-neutral-600">
              {item.email} · {item.role} · {item.isActive ? "활성" : "비활성"}
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void onResetPassword(item.id)}
                disabled={
                  resettingUserId === item.id || deletingUserId === item.id
                }
              >
                {resettingUserId === item.id ? "처리 중..." : "비밀번호 초기화"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void onDelete(item.id)}
                disabled={
                  deletingUserId === item.id || resettingUserId === item.id
                }
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {deletingUserId === item.id ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={onCreateModalOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>사용자 등록</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-1">
              <label
                htmlFor="user-display-name"
                className="text-sm font-medium"
              >
                표시 이름
              </label>
              <Input
                id="user-display-name"
                value={displayName}
                onChange={(e) => onDisplayNameChange(e.target.value)}
                placeholder="표시 이름"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="user-email" className="text-sm font-medium">
                로그인 이메일
              </label>
              <Input
                id="user-email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="로그인 이메일"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="user-password" className="text-sm font-medium">
                초기 비밀번호
              </label>
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="초기 비밀번호"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="user-role" className="text-sm font-medium">
                권한
              </label>
              <Select
                value={role}
                onValueChange={(value) => onRoleChange(value as UserRole)}
              >
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="권한 선택" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="min-w-[96px]">
                취소
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => void onCreate()}
              className="min-w-[96px] bg-black text-white hover:bg-black/90"
            >
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
