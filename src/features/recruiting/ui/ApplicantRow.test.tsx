import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ApplicantRow } from "./ApplicantRow"

import type { ApplicantRow as ApplicantRowModel } from "../model/applicantListTypes"

function createApplicantRow(): ApplicantRowModel {
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
        progress: "inProgress",
        doneCount: 3,
        totalCount: 7,
        result: null,
        myProgress: "inProgress",
      },
      interview: {
        progress: "before",
        doneCount: 0,
        totalCount: 7,
        result: null,
        myProgress: "before",
      },
      final: null,
    },
  }
}

describe("ApplicantRow", () => {
  it("지원 일시와 평가 수를 공용 라벨로 표시한다", () => {
    render(
      <ApplicantRow
        row={createApplicantRow()}
        stage="document"
        expanded={false}
        onToggle={() => {}}
      />,
    )

    expect(screen.getByText("04/22")).toBeInTheDocument()
    expect(screen.getByText("03:33")).toBeInTheDocument()
    expect(screen.getByText("지원")).toBeInTheDocument()
    expect(screen.getByText("3")).toHaveClass("text-teal-500")
    expect(screen.getByText("/")).toHaveClass("text-teal-gray-600")
    expect(screen.getByText("7")).toHaveClass("text-teal-gray-600")
  })

  it("일시가 없으면 대시를 표시하고 행 토글을 유지한다", () => {
    const onToggle = vi.fn()

    render(
      <ApplicantRow
        row={createApplicantRow()}
        stage="interview"
        expanded={false}
        onToggle={onToggle}
      />,
    )

    expect(screen.getByText("-")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "지원자 상세 펼치기" }))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
