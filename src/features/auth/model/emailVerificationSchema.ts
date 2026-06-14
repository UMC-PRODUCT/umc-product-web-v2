import { z } from "zod"

export const emailSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해 주세요."),
})

export const verificationCodeSchema = z.object({
  verificationCode: z
    .string()
    .length(6, "인증 코드는 6자리입니다.")
    .regex(/^\d{6}$/, "숫자 6자리를 입력해 주세요."),
})

export type EmailFormData = z.infer<typeof emailSchema>
export type VerificationCodeFormData = z.infer<typeof verificationCodeSchema>
