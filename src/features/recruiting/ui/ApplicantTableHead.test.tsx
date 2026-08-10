import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ApplicantTableHead } from "./ApplicantTableHead"

describe("ApplicantTableHead", () => {
  it("서류 전형은 지원 일시와 평가 결과 헤더를 표시한다", () => {
    render(<ApplicantTableHead stage="document" />)

    expect(screen.getByText("지원 일시")).toBeInTheDocument()
    expect(screen.getByText("평가 결과")).toBeInTheDocument()
  })

  it("면접 전형은 첫 헤더를 면접 일시로 표시한다", () => {
    render(<ApplicantTableHead stage="interview" />)

    expect(screen.getByText("면접 일시")).toBeInTheDocument()
    expect(screen.queryByText("지원 일시")).not.toBeInTheDocument()
  })

  it("최종 평가는 일시 헤더 없이 최종 결과를 표시한다", () => {
    render(<ApplicantTableHead stage="final" />)

    expect(screen.queryByText("지원 일시")).not.toBeInTheDocument()
    expect(screen.queryByText("면접 일시")).not.toBeInTheDocument()
    expect(screen.getByText("최종 결과")).toBeInTheDocument()
    expect(screen.queryByText("평가 결과")).not.toBeInTheDocument()
  })
})
