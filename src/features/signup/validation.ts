import { z } from "zod"

import {
  codeSchema,
  emailSchema,
  idSchema,
  nicknameSchema,
  passwordSchema,
} from "@/shared/lib/validationSchemas"

// 하위 호환: 기존 소비자(routes 등)가 signup/validation 경유로 참조하던 primitive re-export
export { codeSchema, emailSchema, idSchema, nicknameSchema, passwordSchema }

export const signUpSchemaObject = z.object({
  email: emailSchema,
  code: codeSchema,
  id: idSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  school: z.string().min(1, "학교를 선택해주세요."),
  name: z.string().min(1, "이름을 입력해 주세요."),
  nickname: nicknameSchema,
  termsAgreements: z.record(z.coerce.number(), z.boolean()),
})

export const signUpSchema = signUpSchemaObject.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  },
)

export const oauthSignUpSchema = z.object({
  email: emailSchema,
  code: codeSchema,
  school: z.string().min(1, "학교를 선택해주세요."),
  name: z.string().min(1, "이름을 입력해 주세요."),
  nickname: nicknameSchema,
  termsAgreements: z.record(z.coerce.number(), z.boolean()),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type OAuthSignUpFormData = z.infer<typeof oauthSignUpSchema>

export type ValidationState = "default" | "pending" | "valid" | "invalid"

export const VALIDATION_COLOR_MAP: Record<ValidationState, string> = {
  default: "text-teal-gray-500",
  pending: "text-teal-gray-500",
  valid: "text-success-600",
  invalid: "text-error-500",
}

export const getValidationColor = (state: ValidationState): string =>
  VALIDATION_COLOR_MAP[state]

export const getSimpleValidationState = (
  value: string,
  isValid: boolean,
): ValidationState => (value === "" ? "default" : isValid ? "valid" : "invalid")

export const getPasswordValidationState = (
  password: string,
  isValid: boolean,
  hasInvalidSpecialChar: boolean,
): ValidationState => {
  if (password === "") return "default"
  if (hasInvalidSpecialChar) return "invalid"
  return isValid ? "valid" : "invalid"
}
