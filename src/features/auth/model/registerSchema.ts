import { z } from "zod"

export const basicInfoSchema = z.object({
  name: z.string().max(10, "이름은 최대 10자입니다."),
  nickname: z
    .string()
    .min(1, "닉네임을 입력해주세요.")
    .max(5, "닉네임은 최대 5자입니다.")
    .regex(/^[가-힣]+$/, "닉네임은 한글만 입력 가능합니다."),
  schoolId: z
    .number({ message: "학교를 선택해주세요." })
    .int()
    .positive("학교를 선택해주세요."),
})

export const termsSchema = z.object({
  termsAgreements: z
    .array(z.object({ termsId: z.number(), isAgreed: z.boolean() }))
    .min(1, "필수 약관에 동의해주세요."),
})

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>
export type TermsFormData = z.infer<typeof termsSchema>
