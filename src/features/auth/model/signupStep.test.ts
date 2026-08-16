import { describe, expect, it } from "vitest"

import { resolveEmailSignupStep } from "./signupStep"

describe("resolveEmailSignupStep", () => {
  it("이메일 인증 전에는 EMAIL 단계다", () => {
    expect(resolveEmailSignupStep({})).toBe("EMAIL")
    expect(resolveEmailSignupStep({ emailVerificationToken: "" })).toBe("EMAIL")
    expect(resolveEmailSignupStep({ emailVerificationToken: null })).toBe(
      "EMAIL",
    )
  })

  it("이메일 인증을 마쳤고 비밀번호가 없으면 PASSWORD 단계다", () => {
    expect(
      resolveEmailSignupStep({ emailVerificationToken: "email-token" }),
    ).toBe("PASSWORD")
  })

  it("비밀번호를 아직 입력하지 않았으면 어떤 상태에서도 PASSWORD 를 건너뛰지 않는다", () => {
    expect(
      resolveEmailSignupStep({
        emailVerificationToken: "email-token",
        rawPassword: "",
        isTermsOpen: true,
      }),
    ).toBe("PASSWORD")
  })

  it("비밀번호까지 입력하면 PROFILE 단계다", () => {
    expect(
      resolveEmailSignupStep({
        emailVerificationToken: "email-token",
        rawPassword: "password12!",
      }),
    ).toBe("PROFILE")
  })

  it("약관을 펼치면 TERMS 단계다", () => {
    expect(
      resolveEmailSignupStep({
        emailVerificationToken: "email-token",
        rawPassword: "password12!",
        isTermsOpen: true,
      }),
    ).toBe("TERMS")
  })
})
