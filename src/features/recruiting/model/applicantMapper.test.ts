import { describe, expect, it } from "vitest"

import { getStageStatuses, toApplicantRow, toPartTags } from "./applicantMapper"

import type {
  RecruitingApplicationStatus,
  RecruitingApplicationSummary,
  RecruitingRound,
  RecruitingRoundGroup,
} from "../api/types"

const group: Pick<RecruitingRoundGroup, "chapterName" | "schoolName"> = {
  chapterName: "Ferrum",
  schoolName: "이화여대",
}

const regularRound: Pick<RecruitingRound, "roundId" | "type" | "roundNo"> = {
  roundId: "9001",
  type: "REGULAR",
  roundNo: 1,
}

function summary(
  status: RecruitingApplicationStatus,
  overrides: Partial<RecruitingApplicationSummary> = {},
): RecruitingApplicationSummary {
  return {
    applicationId: "101",
    applicantName: "이예원",
    email: "test@umc.com",
    applicantMemberId: "7",
    firstChoice: "DESIGN",
    secondChoice: null,
    acceptedTrack: null,
    status,
    registrationStatus: "NOT_READY",
    submittedAt: "2026-04-22T03:33:00",
    documentEvaluatedByMe: false,
    interviewEvaluatedByMe: false,
    ...overrides,
  }
}

function rowOf(
  status: RecruitingApplicationStatus,
  overrides: Partial<RecruitingApplicationSummary> = {},
) {
  const row = toApplicantRow(summary(status, overrides), group, regularRound)
  if (!row) throw new Error(`${status}는 행으로 변환되지 않았다`)
  return row
}

describe("toPartTags", () => {
  it("1지망과 2지망을 표시용 파트 태그로 바꾼다", () => {
    expect(toPartTags("PLAN", "WEB_PRODUCT_ENGINEER")).toEqual(["pm", "web-pe"])
  })

  it("모집 대상이 아닌 INFRA_PLUS는 태그로 만들지 않는다", () => {
    expect(toPartTags("INFRA_PLUS", null)).toEqual([])
  })

  it("1지망과 2지망이 같으면 중복을 제거한다", () => {
    expect(toPartTags("DESIGN", "DESIGN")).toEqual(["design"])
  })
})

describe("getStageStatuses", () => {
  it("면접 전형은 면접을 생략한 지원서를 포함하지 않는다", () => {
    expect(getStageStatuses("interview")).not.toContain("INTERVIEW_SKIPPED")
  })

  it("최종 평가는 면접 생략 지원서까지 포함한다", () => {
    expect(getStageStatuses("final")).toContain("INTERVIEW_SKIPPED")
  })

  it("서류 전형은 초안과 철회를 포함하지 않는다", () => {
    const statuses = getStageStatuses("document")
    expect(statuses).not.toContain("DRAFT")
    expect(statuses).not.toContain("CANCELLED")
  })
})

describe("toApplicantRow 목록 대상이 아닌 지원서", () => {
  it("철회한 지원서는 행으로 만들지 않는다", () => {
    expect(toApplicantRow(summary("CANCELLED"), group, regularRound)).toBeNull()
  })

  it("제출 전 초안은 행으로 만들지 않는다", () => {
    expect(toApplicantRow(summary("DRAFT"), group, regularRound)).toBeNull()
  })
})

describe("toApplicantRow 전형별 진행 상태", () => {
  it("제출 직후에는 서류가 결정 전이고 이후 전형이 없다", () => {
    const row = rowOf("SUBMITTED")

    expect(row.evaluations.document.progress).toBe("inProgress")
    expect(row.evaluations.document.result).toBeNull()
    expect(row.evaluations.interview).toBeNull()
    expect(row.evaluations.final).toBeNull()
  })

  it("서류 탈락은 서류 결과만 불합격으로 남는다", () => {
    const row = rowOf("DOCUMENT_FAILED")

    expect(row.evaluations.document.progress).toBe("done")
    expect(row.evaluations.document.result).toBe("fail")
    expect(row.evaluations.interview).toBeNull()
    expect(row.evaluations.final).toBeNull()
  })

  it("면접 배정은 서류 합격 + 면접 결정 전이다", () => {
    const row = rowOf("INTERVIEW_ASSIGNED")

    expect(row.evaluations.document.result).toBe("pass")
    expect(row.evaluations.interview?.progress).toBe("inProgress")
    expect(row.evaluations.interview?.result).toBeNull()
    expect(row.evaluations.final?.progress).toBe("inProgress")
  })

  it("면접 생략은 면접 전형에서 빠지고 최종에는 남는다", () => {
    const row = rowOf("INTERVIEW_SKIPPED")

    expect(row.evaluations.document.result).toBe("pass")
    expect(row.evaluations.interview).toBeNull()
    expect(row.evaluations.final).not.toBeNull()
  })

  it("최종 합격은 면접과 최종 결과가 함께 합격이 된다", () => {
    const row = rowOf("FINAL_PASSED")

    expect(row.evaluations.interview?.result).toBe("pass")
    expect(row.evaluations.final?.result).toBe("pass")
    expect(row.evaluations.final?.progress).toBe("done")
  })

  it("최종 불합격은 면접과 최종 결과가 함께 불합격이 된다", () => {
    const row = rowOf("FINAL_FAILED")

    expect(row.evaluations.interview?.result).toBe("fail")
    expect(row.evaluations.final?.result).toBe("fail")
  })
})

describe("toApplicantRow 내 평가 여부", () => {
  it("서류와 면접의 내 제출 여부를 각각 반영한다", () => {
    const row = rowOf("FINAL_PASSED", {
      documentEvaluatedByMe: true,
      interviewEvaluatedByMe: false,
    })

    expect(row.evaluations.document.myProgress).toBe("done")
    expect(row.evaluations.interview?.myProgress).toBe("before")
  })

  it("최종은 평가 단계가 아니라 내 제출 여부를 갖지 않는다", () => {
    const row = rowOf("FINAL_PASSED", { documentEvaluatedByMe: true })

    expect(row.evaluations.final?.myProgress).toBe("before")
  })
})

describe("toApplicantRow 차수·소속 정보", () => {
  it("지부와 학교는 차수 그룹에서 가져온다", () => {
    const row = rowOf("SUBMITTED")

    expect(row.chapter).toBe("Ferrum")
    expect(row.school).toBe("이화여대")
  })

  it("본모집은 추가 차수 번호를 갖지 않는다", () => {
    const row = rowOf("SUBMITTED")

    expect(row.recruitmentType).toBe("regular")
    expect(row.additionalRound).toBeUndefined()
  })

  it("추가모집은 차수 번호를 함께 담는다", () => {
    const row = toApplicantRow(summary("SUBMITTED"), group, {
      roundId: "9002",
      type: "ADDITIONAL",
      roundNo: 2,
    })

    expect(row?.recruitmentType).toBe("additional")
    expect(row?.additionalRound).toBe(2)
    expect(row?.roundId).toBe("9002")
  })

  it("제출 시각이 없으면 빈 문자열로 둔다", () => {
    const row = rowOf("SUBMITTED", { submittedAt: null })

    expect(row.appliedAt).toBe("")
  })
})
