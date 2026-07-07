// 범용 폼 필드 검증 스키마(zod). auth/signup/login이 공유하는 primitive.

import { z } from "zod"

export const emailSchema = z
  .string()
  .email("올바른 이메일 형식을 입력해 주세요.")

export const codeSchema = z
  .string()
  .length(6, "인증번호 6자리를 입력해 주세요.")

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
