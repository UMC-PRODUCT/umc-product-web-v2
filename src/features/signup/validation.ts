import { z } from "zod"

export const idSchema = z
  .string()
  .min(5, "아이디는 5자 이상이어야 합니다")
  .max(20, "아이디는 20자 이하여야 합니다")
  .regex(/^[a-z0-9_-]*$/, "5~20자의 영문, 숫자와 특수기호(_),(-) 사용 가능")

export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다")
  .max(16, "비밀번호는 16자 이하여야 합니다")
  .refine((pw) => {
    const hasLetter = /[a-zA-Z]/.test(pw)
    const hasNumber = /[0-9]/.test(pw)
    const hasSpecial = /[!#$&*@?]/.test(pw)
    const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length
    return typeCount >= 2
  }, "영문, 숫자, 특수문자 중 2종류 이상 포함한 8-16자")
  .refine(
    (pw) => /^[a-zA-Z0-9!#$&*@?]*$/.test(pw),
    "사용 가능한 특수문자 !#$&*@?",
  )

export const nicknameSchema = z
  .string()
  .regex(/^[가-힣\s]*$/)
  .refine((nickname) => nickname.replace(/\s/g, "").length >= 1)
  .refine((nickname) => nickname.replace(/\s/g, "").length <= 5)
  .refine((nickname) => !/\s/.test(nickname))

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

export const getPasswordValidationError = (value: string): boolean => {
  const result = passwordSchema.safeParse(value)
  return !result.success
    ? result.error.issues.some((issue) =>
        issue.message.includes("사용 가능한 특수문자"),
      )
    : false
}
