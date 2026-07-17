import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DEFAULT_APPLICANT_LIST_FILTERS } from "../model/applicantListTypes"
import { ApplicantTableCard } from "./ApplicantTableCard"

import type {
  ApplicantRow,
  EvaluationProgress,
} from "../model/applicantListTypes"

function createApplicant(
  progress: EvaluationProgress = "inProgress",
): ApplicantRow {
  return {
    applicationId: "101",
    appliedAt: "2026-04-22T03:33:00",
    interviewAt: null,
    applicantName: "테스터",
    chapter: "Chromium",
    school: "테스트대",
    recruitmentType: "regular",
    parts: ["web-pe"],
    evaluations: {
      document: {
        progress,
        doneCount: progress === "done" ? 7 : progress === "before" ? 0 : 3,
        totalCount: 7,
        result: progress === "done" ? "pass" : null,
        myProgress: progress,
      },
      interview: null,
      final: null,
    },
  }
}

function renderCard(visibleRows: ApplicantRow[], allStageRows: ApplicantRow[]) {
  return render(
    <ApplicantTableCard
      visibleRows={visibleRows}
      allStageRows={allStageRows}
      stage="document"
      totalCount={visibleRows.length}
      baseTime="26-07-04 02:48"
      filters={DEFAULT_APPLICANT_LIST_FILTERS}
      onFiltersChange={() => {}}
    />,
  )
}

describe("ApplicantTableCard", () => {
  it("필터 결과가 비어도 원본 전형 데이터로 카드 상태를 계산한다", () => {
    renderCard([], [createApplicant()])

    expect(screen.getByText("평가 진행중")).toBeInTheDocument()
    expect(screen.queryByText("지원 전")).not.toBeInTheDocument()
    expect(screen.getByText("현재 지원자가 없습니다.")).toBeInTheDocument()
  })

  it("전형 평가가 모두 완료되면 평가 완료 상태를 표시한다", () => {
    renderCard([], [createApplicant("done")])

    expect(screen.getByText("평가 완료")).toBeInTheDocument()
  })

  it("전형 평가가 모두 시작 전이면 평가 전 상태를 표시한다", () => {
    renderCard([], [createApplicant("before")])

    expect(screen.getByText("평가 전")).toBeInTheDocument()
    expect(screen.queryByText("평가 진행중")).not.toBeInTheDocument()
  })

  it("원본 전형 데이터가 없으면 지원 전 상태를 표시한다", () => {
    renderCard([], [])

    expect(screen.getByText("지원 전")).toBeInTheDocument()
  })
})
