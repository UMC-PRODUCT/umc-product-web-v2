import { describe, expect, it } from "vitest"

import {
  isApplyButtonDisabled,
  resolveProjectDetailCtaMode,
  selectCurrentApplicationForProject,
  selectIsAlreadyApproved,
} from "./projectDetailCta"

const applicable = {
  isPmReadonly: false,
  isDetailLoading: false,
  hasApplicationForm: true,
  isWritePermissionLoading: false,
  canWriteApplication: true,
  hasActiveRound: true,
  isApplicationStatusResolving: false,
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

  it("지원 이력 조회 중에는 비활성화한다(타 프로젝트 활성 지원서 판단 보류)", () => {
    expect(
      isApplyButtonDisabled({
        ...applicable,
        isApplicationStatusResolving: true,
      }),
    ).toBe(true)
  })

  it("PM 읽기 전용 컨텍스트에서는 지원 이력 조회 중이어도 비활성화하지 않는다", () => {
    expect(
      isApplyButtonDisabled({
        ...applicable,
        isPmReadonly: true,
        isApplicationStatusResolving: true,
      }),
    ).toBe(false)
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

const application = (
  over: Partial<{
    applicationId: string | null
    projectId: string
    status: string
    matchingRound: { id: string | null }
  }> = {},
) => ({
  applicationId: "1",
  projectId: "100",
  status: "SUBMITTED",
  matchingRound: { id: "1" },
  ...over,
})

const ctaParams = {
  isOperator: false,
  isPm: false,
  isSameBranch: true,
  isApplied: false,
  hasOtherActiveApplication: false,
  isAlreadyApproved: false,
  isPartIneligible: false,
  isPartRecruitClosed: false,
}

describe("resolveProjectDetailCtaMode", () => {
  it("기본 조건이면 apply를 반환한다", () => {
    expect(resolveProjectDetailCtaMode(ctaParams)).toBe("apply")
  })

  it("내 파트를 모집하지 않는 프로젝트면 apply-blocked-part를 반환한다", () => {
    expect(
      resolveProjectDetailCtaMode({ ...ctaParams, isPartIneligible: true }),
    ).toBe("apply-blocked-part")
  })

  it("이미 지원한 프로젝트면 파트 부적격이어도 my-application을 우선한다", () => {
    expect(
      resolveProjectDetailCtaMode({
        ...ctaParams,
        isApplied: true,
        isPartIneligible: true,
      }),
    ).toBe("my-application")
  })

  it("다른 프로젝트에 지원 중이면 파트 부적격이어도 apply-blocked-other를 반환한다", () => {
    expect(
      resolveProjectDetailCtaMode({
        ...ctaParams,
        hasOtherActiveApplication: true,
        isPartIneligible: true,
      }),
    ).toBe("apply-blocked-other")
  })

  it("내 파트 모집이 마감된 프로젝트면 apply-blocked-closed를 반환한다", () => {
    expect(
      resolveProjectDetailCtaMode({ ...ctaParams, isPartRecruitClosed: true }),
    ).toBe("apply-blocked-closed")
  })

  it("내 파트 모집이 마감되어도 이미 지원한 프로젝트면 my-application을 우선한다", () => {
    expect(
      resolveProjectDetailCtaMode({
        ...ctaParams,
        isApplied: true,
        isPartRecruitClosed: true,
      }),
    ).toBe("my-application")
  })
})

describe("selectCurrentApplicationForProject", () => {
  it("활성 차수가 있을 때 이전 차수 지원서는 현재 지원 상태로 보지 않는다", () => {
    const result = selectCurrentApplicationForProject({
      applications: [application({ matchingRound: { id: "1" } })],
      projectId: 100,
      activeMatchingRoundId: "2",
    })
    expect(result).toBeUndefined()
  })

  it("활성 차수의 지원서가 있으면 해당 지원서를 반환한다", () => {
    const current = application({
      applicationId: "9",
      matchingRound: { id: "2" },
    })
    const result = selectCurrentApplicationForProject({
      applications: [application({ matchingRound: { id: "1" } }), current],
      projectId: 100,
      activeMatchingRoundId: "2",
    })
    expect(result).toBe(current)
  })

  it("활성 차수가 없으면(차수 사이) 취소되지 않은 지원서를 조회용으로 반환한다", () => {
    const past = application({
      matchingRound: { id: "1" },
      status: "REJECTED",
    })
    const result = selectCurrentApplicationForProject({
      applications: [past],
      projectId: 100,
      activeMatchingRoundId: null,
    })
    expect(result).toBe(past)
  })

  it("활성 차수 조회 중(undefined)이면 폴백 없이 undefined를 반환해 CTA 깜빡임을 막는다", () => {
    const past = application({
      matchingRound: { id: "1" },
      status: "SUBMITTED",
    })
    const result = selectCurrentApplicationForProject({
      applications: [past],
      projectId: 100,
      activeMatchingRoundId: undefined,
    })
    expect(result).toBeUndefined()
  })

  it("applicationId가 없는 지원서는 무시한다", () => {
    const result = selectCurrentApplicationForProject({
      applications: [
        application({ applicationId: null, matchingRound: { id: "2" } }),
      ],
      projectId: 100,
      activeMatchingRoundId: "2",
    })
    expect(result).toBeUndefined()
  })

  it("취소된 지원서는 무시한다", () => {
    const result = selectCurrentApplicationForProject({
      applications: [
        application({ status: "CANCELLED", matchingRound: { id: "2" } }),
      ],
      projectId: 100,
      activeMatchingRoundId: "2",
    })
    expect(result).toBeUndefined()
  })

  it("다른 프로젝트의 지원서는 선택하지 않는다", () => {
    const result = selectCurrentApplicationForProject({
      applications: [
        application({ projectId: "999", matchingRound: { id: "2" } }),
      ],
      projectId: 100,
      activeMatchingRoundId: "2",
    })
    expect(result).toBeUndefined()
  })
})

describe("selectIsAlreadyApproved", () => {
  it("정규 차수에서 합격(APPROVED)한 지원서가 있으면 true", () => {
    expect(
      selectIsAlreadyApproved([
        { status: "APPROVED", matchingRound: { id: "1" } },
      ]),
    ).toBe(true)
  })

  it("이전 차수에서 합격했으면 후속 차수에서도 true (합격자 후속 차수 차단 유지)", () => {
    expect(
      selectIsAlreadyApproved([
        { status: "APPROVED", matchingRound: { id: "1" } },
        { status: "SUBMITTED", matchingRound: { id: "2" } },
      ]),
    ).toBe(true)
  })

  it("랜덤매칭 카드(matchingRound.id=null)의 APPROVED는 차단 대상에서 제외하여 false", () => {
    expect(
      selectIsAlreadyApproved([
        { status: "APPROVED", matchingRound: { id: null } },
      ]),
    ).toBe(false)
  })

  it("합격 이력이 없으면 false", () => {
    expect(
      selectIsAlreadyApproved([
        { status: "SUBMITTED", matchingRound: { id: "1" } },
        { status: "CANCELLED", matchingRound: { id: "2" } },
      ]),
    ).toBe(false)
  })

  it("빈 배열과 undefined는 false", () => {
    expect(selectIsAlreadyApproved([])).toBe(false)
    expect(selectIsAlreadyApproved(undefined)).toBe(false)
  })
})
