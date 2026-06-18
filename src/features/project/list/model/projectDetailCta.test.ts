import { describe, expect, it } from "vitest"

import {
  isApplyButtonDisabled,
  resolveProjectDetailCtaMode,
  selectCurrentApplicationForProject,
  selectIsAlreadyApproved,
  selectIsPartIneligible,
  selectIsPartRecruitClosed,
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

  it("임시저장(DRAFT) 지원서면 이어쓰기를 위해 apply를 반환한다", () => {
    expect(
      resolveProjectDetailCtaMode({
        ...ctaParams,
        isApplied: true,
        isDraftApplication: true,
      }),
    ).toBe("apply")
  })

  it("DRAFT 이어쓰기는 합격/타프로젝트 지원 차단보다 우선한다", () => {
    expect(
      resolveProjectDetailCtaMode({
        ...ctaParams,
        isApplied: true,
        isDraftApplication: true,
        isAlreadyApproved: true,
        hasOtherActiveApplication: true,
      }),
    ).toBe("apply")
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

describe("파트 적격/마감 판정 (dev 실데이터 기반, Web 계정)", () => {
  const projects = {
    "13-중앙대1": [
      { part: "WEB", currentCount: "3", quota: "3", status: "COMPLETED" },
      {
        part: "SPRINGBOOT",
        currentCount: "3",
        quota: "3",
        status: "COMPLETED",
      },
      { part: "DESIGN", currentCount: "0", quota: "1", status: "RECRUITING" },
    ],
    "14-중앙대2": [
      { part: "DESIGN", currentCount: "1", quota: "2", status: "RECRUITING" },
      { part: "WEB", currentCount: "4", quota: "4", status: "COMPLETED" },
      {
        part: "SPRINGBOOT",
        currentCount: "4",
        quota: "4",
        status: "COMPLETED",
      },
    ],
    "15-한성대1": [
      { part: "DESIGN", currentCount: "1", quota: "20", status: "RECRUITING" },
      { part: "WEB", currentCount: "20", quota: "20", status: "COMPLETED" },
      { part: "NODEJS", currentCount: "20", quota: "20", status: "COMPLETED" },
    ],
    "16-중앙대3": [
      { part: "DESIGN", currentCount: "0", quota: "2", status: "RECRUITING" },
      { part: "ANDROID", currentCount: "4", quota: "4", status: "COMPLETED" },
      { part: "NODEJS", currentCount: "4", quota: "4", status: "COMPLETED" },
    ],
    "17-중앙대4": [
      { part: "DESIGN", currentCount: "0", quota: "2", status: "RECRUITING" },
      { part: "IOS", currentCount: "3", quota: "3", status: "COMPLETED" },
      {
        part: "SPRINGBOOT",
        currentCount: "4",
        quota: "4",
        status: "COMPLETED",
      },
    ],
    "23-가천대": [
      { part: "DESIGN", currentCount: "0", quota: "1", status: "RECRUITING" },
      { part: "WEB", currentCount: "0", quota: "1", status: "RECRUITING" },
      {
        part: "SPRINGBOOT",
        currentCount: "0",
        quota: "1",
        status: "RECRUITING",
      },
    ],
    "37-가천대": [
      { part: "IOS", currentCount: "0", quota: "1", status: "RECRUITING" },
      {
        part: "SPRINGBOOT",
        currentCount: "0",
        quota: "2",
        status: "RECRUITING",
      },
    ],
  } satisfies Record<
    string,
    { part: string; currentCount: string; quota: string; status: string }[]
  >

  const ctaForWeb = (key: keyof typeof projects) =>
    resolveProjectDetailCtaMode({
      ...ctaParams,
      isPartIneligible: selectIsPartIneligible(projects[key], "WEB"),
      isPartRecruitClosed: selectIsPartRecruitClosed(projects[key], "WEB"),
      hasActiveRound: true,
    })

  it("WEB 정원이 마감(COMPLETED)된 프로젝트는 apply-blocked-closed", () => {
    expect(ctaForWeb("13-중앙대1")).toBe("apply-blocked-closed")
    expect(ctaForWeb("14-중앙대2")).toBe("apply-blocked-closed")
    expect(ctaForWeb("15-한성대1")).toBe("apply-blocked-closed")
  })

  it("WEB 파트를 아예 모집하지 않는 프로젝트는 apply-blocked-part", () => {
    expect(ctaForWeb("16-중앙대3")).toBe("apply-blocked-part")
    expect(ctaForWeb("17-중앙대4")).toBe("apply-blocked-part")
    expect(ctaForWeb("37-가천대")).toBe("apply-blocked-part")
  })

  it("WEB 파트를 모집 중(RECRUITING)인 프로젝트는 apply(지원 가능)", () => {
    expect(ctaForWeb("23-가천대")).toBe("apply")
  })

  it("내 파트를 알 수 없으면(undefined) 파트 사유로 막지 않는다", () => {
    expect(selectIsPartIneligible(projects["16-중앙대3"], undefined)).toBe(
      false,
    )
    expect(selectIsPartRecruitClosed(projects["14-중앙대2"], undefined)).toBe(
      false,
    )
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
