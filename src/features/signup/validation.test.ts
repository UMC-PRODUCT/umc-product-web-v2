import { describe, expect, it } from "vitest"

import { nameSchema, oauthSignUpSchema, signUpSchema } from "./validation"

describe("nameSchema", () => {
  it("공백을 자동으로 제거(.trim())하고 1~10자 이름을 허용한다", () => {
    const result = nameSchema.safeParse("  홍길동  ")
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe("홍길동")
    }
  })

  it("공백으로만 이루어진 이름 입력 시 에러 메시지를 반환한다", () => {
    const result = nameSchema.safeParse("   ")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("이름을 입력해 주세요.")
    }
  })

  it("10자를 초과하는 이름 입력 시 에러 메시지를 반환한다", () => {
    const result = nameSchema.safeParse("가나다라마바사아자차카타파하")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "이름은 10자 이하로 입력해 주세요.",
      )
    }
  })

  it("앞뒤 공백 제거 후 10자를 초과하는 경우 에러를 반환한다", () => {
    const result = nameSchema.safeParse("  가나다라마바사아자차카타파하  ")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "이름은 10자 이하로 입력해 주세요.",
      )
    }
  })
})

describe("signUpSchema name validation", () => {
  const baseValidData = {
    email: "test@example.com",
    code: "123456",
    id: "test@example.com",
    password: "password1!",
    confirmPassword: "password1!",
    school: "한국대학교",
    nickname: "홍길동",
    termsAgreements: {},
  }

  it("signUpSchema에서 10자 초과 이름 검증 실패", () => {
    const result = signUpSchema.safeParse({
      ...baseValidData,
      name: "가나다라마바사아자차카타파하",
    })
    expect(result.success).toBe(false)
  })

  it("signUpSchema에서 정상 이름 및 공백 포함 이름 검증 성공 및 trim 반영", () => {
    const result = signUpSchema.safeParse({
      ...baseValidData,
      name: "  홍길동  ",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("홍길동")
    }
  })
})

describe("oauthSignUpSchema name validation", () => {
  const baseValidData = {
    email: "test@example.com",
    code: "123456",
    school: "한국대학교",
    nickname: "홍길동",
    termsAgreements: {},
  }

  it("oauthSignUpSchema에서 10자 초과 이름 검증 실패", () => {
    const result = oauthSignUpSchema.safeParse({
      ...baseValidData,
      name: "가나다라마바사아자차카타파하",
    })
    expect(result.success).toBe(false)
  })

  it("oauthSignUpSchema에서 정상 이름 및 공백 포함 이름 검증 성공 및 trim 반영", () => {
    const result = oauthSignUpSchema.safeParse({
      ...baseValidData,
      name: "  홍길동  ",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("홍길동")
    }
  })
})
