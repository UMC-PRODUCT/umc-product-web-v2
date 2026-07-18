import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

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
      baseTime="26-07-04 02:48"
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

  it("모집 공고가 없으면 모집 전 상태와 안내 문구를 표시한다", () => {
    render(
      <ApplicantTableCard
        visibleRows={[]}
        allStageRows={[]}
        stage="document"
        baseTime="26-07-04 02:48"
        hasRecruitment={false}
      />,
    )

    expect(screen.getByText("모집 전")).toBeInTheDocument()
    expect(
      screen.getByText("현재 등록된 모집 공고가 없습니다."),
    ).toBeInTheDocument()
  })

  it("추가 모집만 선택하고 비어 있으면 추가 모집 문구를 표시한다", () => {
    render(
      <ApplicantTableCard
        visibleRows={[]}
        allStageRows={[]}
        stage="document"
        baseTime="26-07-04 02:48"
        initialCardFilters={{ includeRegular: false }}
      />,
    )

    expect(
      screen.getByText("현재 추가 모집 지원자가 없습니다."),
    ).toBeInTheDocument()
  })

  it("마지막 남은 모집 체크는 해제할 수 없다", () => {
    render(
      <ApplicantTableCard
        visibleRows={[]}
        allStageRows={[]}
        stage="document"
        baseTime="26-07-04 02:48"
        initialCardFilters={{ includeRegular: false }}
      />,
    )

    fireEvent.click(screen.getByRole("checkbox", { name: "추가 모집 포함" }))

    expect(
      screen.getByRole("checkbox", { name: "추가 모집 포함" }),
    ).toBeChecked()
  })
})
