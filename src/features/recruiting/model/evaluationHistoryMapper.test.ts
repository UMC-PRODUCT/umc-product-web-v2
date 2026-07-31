import { describe, expect, it } from "vitest"

import {
  toEvaluationHistoryEntry,
  toHistoryProgress,
} from "./evaluationHistoryMapper"

import type { RecruitingDecisionHistory } from "../api/types"

function history(
  override: Partial<RecruitingDecisionHistory> = {},
): RecruitingDecisionHistory {
  return {
    decisionHistoryId: "7",
    applicationId: "40",
    decidedAt: "2026-07-30T10:22:48Z",
    decisionStatus: "FINAL_PASSED",
    result: "PASSED",
    applicant: {
      chapterId: "29",
      chapterName: "Chromium",
      schoolId: "6",
      schoolName: "광운대학교",
      name: "김지원",
      firstChoice: "PLAN",
      secondChoice: "DESIGN",
      acceptedTrack: "PLAN",
    },
    decider: {
      memberId: "11",
      chapterId: "29",
      chapterName: "Chromium",
      schoolId: "6",
      schoolName: "광운대학교",
      roleType: "SCHOOL_PRESIDENT",
      name: "박회장",
      nickname: "회장님",
    },
    ...override,
  }
}

describe("toEvaluationHistoryEntry", () => {
  it("판정 이력을 화면 행으로 옮긴다", () => {
    const entry = toEvaluationHistoryEntry(history())

    expect(entry.id).toBe("7")
    expect(entry.processedAt).toBe("2026-07-30T10:22:48Z")
    expect(entry.applicant).toEqual({
      chapterId: "29",
      schoolId: "6",
      chapter: "Chromium",
      school: "광운대학교",
      name: "김지원",
      part: "pm",
      result: "pass",
    })
    expect(entry.evaluator.id).toBe("11")
    expect(entry.evaluator.nickname).toBe("회장님")
  })

  it("PASSED/FAILED 를 pass/fail 로 옮긴다", () => {
    expect(toEvaluationHistoryEntry(history()).applicant.result).toBe("pass")
    expect(
      toEvaluationHistoryEntry(
        history({ result: "FAILED", decisionStatus: "DOCUMENT_FAILED" }),
      ).applicant.result,
    ).toBe("fail")
  })

  // 파트는 1지망 기준이다. 2지망이 달라도 영향을 주지 않는다.
  it("지원 파트는 1지망을 쓴다", () => {
    const entry = toEvaluationHistoryEntry(
      history({
        applicant: {
          ...history().applicant,
          firstChoice: "WEB_PRODUCT_ENGINEER",
          secondChoice: "PLAN",
        },
      }),
    )

    expect(entry.applicant.part).toBe("web-pe")
  })

  // 직위는 판정 시점 roleType 스냅샷이라 이후 직위가 바뀌어도 그대로 보존된다.
  it("roleType 을 직위 라벨로 옮긴다", () => {
    expect(toEvaluationHistoryEntry(history()).evaluator.position).toBe(
      "교내 회장",
    )
    expect(
      toEvaluationHistoryEntry(
        history({
          decider: { ...history().decider, roleType: "CENTRAL_PRESIDENT" },
        }),
      ).evaluator.position,
    ).toBe("총괄")
  })

  // 중앙 직위와 SUPER_ADMIN 은 지부·학교가 null 로 온다.
  it("담당자 지부·학교가 null 이면 빈 문자열로 둔다", () => {
    const entry = toEvaluationHistoryEntry(
      history({
        decider: {
          ...history().decider,
          chapterId: null,
          chapterName: null,
          schoolId: null,
          schoolName: null,
          roleType: "CENTRAL_OPERATING_TEAM_MEMBER",
        },
      }),
    )

    expect(entry.evaluator.chapter).toBe("")
    expect(entry.evaluator.school).toBe("")
  })

  // 프론트 CHAPTERS 상수에 없는 지부도 그대로 표시한다.
  it("상수에 없는 지부명도 버리지 않는다", () => {
    const entry = toEvaluationHistoryEntry(
      history({
        applicant: { ...history().applicant, chapterName: "GOAT" },
      }),
    )

    expect(entry.applicant.chapter).toBe("GOAT")
  })
})

describe("toHistoryProgress", () => {
  it("서버 진행 상태를 화면 뱃지 값으로 옮긴다", () => {
    expect(toHistoryProgress("BEFORE_EVALUATION")).toBe("before")
    expect(toHistoryProgress("IN_PROGRESS")).toBe("inProgress")
    expect(toHistoryProgress("COMPLETED")).toBe("done")
  })
})
