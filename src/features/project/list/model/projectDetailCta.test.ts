import { describe, expect, it } from "vitest"

import { isApplyButtonDisabled } from "./projectDetailCta"

const applicable = {
  isPmReadonly: false,
  isDetailLoading: false,
  hasApplicationForm: true,
  isWritePermissionLoading: false,
  canWriteApplication: true,
  hasActiveRound: true,
}

describe("isApplyButtonDisabled", () => {
  it("모든 조건을 충족하면 지원 버튼을 활성화한다", () => {
    expect(isApplyButtonDisabled(applicable)).toBe(false)
  })

  it("활성 매칭 라운드가 없으면 지원 버튼을 비활성화한다", () => {
    expect(
      isApplyButtonDisabled({ ...applicable, hasActiveRound: false }),
    ).toBe(true)
  })

  it("지원 양식이 없으면 비활성화한다", () => {
    expect(
      isApplyButtonDisabled({ ...applicable, hasApplicationForm: false }),
    ).toBe(true)
  })

  it("지원 작성 권한이 없으면 비활성화한다", () => {
    expect(
      isApplyButtonDisabled({ ...applicable, canWriteApplication: false }),
    ).toBe(true)
  })

  it("권한 조회 중에는 비활성화한다", () => {
    expect(
      isApplyButtonDisabled({ ...applicable, isWritePermissionLoading: true }),
    ).toBe(true)
  })

  it("PM 읽기 전용 컨텍스트에서는 라운드가 없어도 비활성화하지 않는다", () => {
    expect(
      isApplyButtonDisabled({
        ...applicable,
        isPmReadonly: true,
        hasActiveRound: false,
        hasApplicationForm: false,
        canWriteApplication: false,
      }),
    ).toBe(false)
  })

  it("상세 로딩 중에는 양식 미확인을 이유로 비활성화하지 않는다", () => {
    expect(
      isApplyButtonDisabled({
        ...applicable,
        isDetailLoading: true,
        hasApplicationForm: false,
      }),
    ).toBe(false)
  })
})
