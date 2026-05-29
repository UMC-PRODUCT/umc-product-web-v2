import { z } from "zod"

export const emailSchema = z
  .string()
  .email("올바른 이메일 형식을 입력해 주세요.")
export const codeSchema = z
  .string()
  .length(6, "인증번호 6자리를 입력해 주세요.")

export const phoneNumberSchema = z
  .string()
  .regex(/^010\d{8}$/, "올바른 전화번호 형식을 입력해 주세요.")
export const phoneCodeSchema = z
  .string()
  .length(6, "인증번호 6자리를 입력해 주세요.")

// export const idSchema = z
//   .string()
//   .min(5, "아이디는 5자 이상이어야 합니다")
//   .max(20, "아이디는 20자 이하여야 합니다")
//   .regex(/^[a-z0-9_-]*$/, "5~20자의 영문, 숫자와 특수기호(_),(-) 사용 가능")
export const idSchema = emailSchema

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
  .min(1)
  .max(5)
  .regex(/^[가-힣]*$/, "공백 없이 한글 1-5자")

export const signUpSchema = z
  .object({
    email: emailSchema,
    code: codeSchema,
    phoneNumber: phoneNumberSchema,
    phoneCode: phoneCodeSchema,
    id: idSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    school: z.string().min(1, "학교를 선택해주세요."),
    name: z.string().min(1, "이름을 입력해 주세요."),
    nickname: nicknameSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>

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
