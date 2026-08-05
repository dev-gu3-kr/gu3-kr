import { z } from "zod"

export const adminUsernameSchema = z
  .string()
  .trim()
  .min(1, "아이디를 입력해 주세요.")
  .max(50, "아이디는 50자 이하로 입력해 주세요.")
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    "아이디는 영문, 숫자, 점, 밑줄, 하이픈만 사용할 수 있습니다.",
  )

export const loginSchema = z.object({
  username: adminUsernameSchema,
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상 입력해 주세요.")
    .max(128, "비밀번호는 128자 이하로 입력해 주세요."),
})
