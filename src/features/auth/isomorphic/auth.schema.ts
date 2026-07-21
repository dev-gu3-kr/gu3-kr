import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().pipe(z.email("올바른 이메일을 입력해 주세요.")),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상 입력해 주세요.")
    .max(128, "비밀번호는 128자 이하로 입력해 주세요."),
})
