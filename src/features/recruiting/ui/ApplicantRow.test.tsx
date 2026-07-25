import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ApplicantRow } from "./ApplicantRow"

import type { ApplicantRow as ApplicantRowModel } from "../model/applicantListTypes"

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}))

function createApplicantRow(): ApplicantRowModel {
  return {
    applicationId: "101",
    roundId: "9001",
    appliedAt: "2026-04-22T03:33:00",
    applicantName: "테스터",
    chapter: "Chromium",
    school: "테스트대",
    recruitmentType: "regular",
    parts: ["web-pe"],
    evaluations: {
      document: {
        progress: "inProgress",
        result: null,
        myProgress: "inProgress",
      },
      interview: {
        progress: "before",
        result: null,
        myProgress: "before",
      },
      final: null,
    },
  }
}

describe("ApplicantRow", () => {
  it("지원 일시를 공용 라벨로 표시한다", () => {
    render(<ApplicantRow row={createApplicantRow()} stage="document" />)

    expect(screen.getByText("04/22")).toBeInTheDocument()
    expect(screen.getByText("03:33")).toBeInTheDocument()
    expect(screen.getByText("지원")).toBeInTheDocument()
  })

  it("평가 진행 수 카운터는 렌더하지 않는다", () => {
    render(<ApplicantRow row={createApplicantRow()} stage="document" />)

    expect(screen.queryByText("/")).not.toBeInTheDocument()
  })

  it("면접 전형도 지원 일시를 그대로 쓴다", () => {
    render(<ApplicantRow row={createApplicantRow()} stage="interview" />)

    expect(screen.getByText("04/22")).toBeInTheDocument()
    expect(screen.getByText("지원")).toBeInTheDocument()
  })

  it("일시가 없으면 대시를 표시한다", () => {
    const row = createApplicantRow()
    row.appliedAt = ""

    render(<ApplicantRow row={row} stage="document" />)

    expect(screen.getByText("-")).toBeInTheDocument()
  })

  it("행 확장 토글 버튼을 렌더하지 않는다", () => {
    render(<ApplicantRow row={createApplicantRow()} stage="document" />)

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("평가가 완료됐어도 결과가 없으면 결과 태그를 표시하지 않는다", () => {
    const row = createApplicantRow()
    row.evaluations.document = {
      progress: "done",
      result: null,
      myProgress: "done",
    }

    render(<ApplicantRow row={row} stage="document" />)

    expect(screen.queryByText("대기")).not.toBeInTheDocument()
    expect(screen.queryByText("합격")).not.toBeInTheDocument()
    expect(screen.queryByText("불합격")).not.toBeInTheDocument()
  })

  it("최종 평가에서는 일시 컬럼과 평가 수를 렌더하지 않는다", () => {
    const row = createApplicantRow()
    row.evaluations.final = {
      progress: "done",
      result: "pass",
      myProgress: "done",
    }

    render(<ApplicantRow row={row} stage="final" />)

    expect(screen.queryByText("04/22")).not.toBeInTheDocument()
    expect(screen.queryByText("-")).not.toBeInTheDocument()
    expect(screen.queryByText("/")).not.toBeInTheDocument()
    expect(screen.getByText("완료")).toBeInTheDocument()
  })
})
