import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import {
  type ApplicantListFilters,
  DEFAULT_APPLICANT_LIST_FILTERS,
} from "../model/applicantListTypes"
import { ApplicantFilterBar } from "./ApplicantFilterBar"

function ApplicantFilterBarHarness() {
  const [filters, setFilters] = useState<ApplicantListFilters>({
    ...DEFAULT_APPLICANT_LIST_FILTERS,
    schools: ["광운대"],
  })

  return (
    <>
      <ApplicantFilterBar
        filters={filters}
        onFiltersChange={(partial) =>
          setFilters((current) => ({ ...current, ...partial }))
        }
        resultFilterLabel="서류 평가 결과"
      />
      <output data-testid="selected-schools">
        {filters.schools.join(",")}
      </output>
    </>
  )
}

describe("ApplicantFilterBar 지부 필터", () => {
  it("지부 선택이 바뀌면 기존 학교 선택을 초기화한다", () => {
    render(<ApplicantFilterBarHarness />)

    fireEvent.click(screen.getByRole("button", { name: "지부" }))
    fireEvent.click(screen.getByRole("option", { name: "Ferrum" }))

    expect(screen.getByTestId("selected-schools")).toBeEmptyDOMElement()
    expect(screen.getByRole("button", { name: "학교" })).toBeInTheDocument()
  })

  it("지부 스코프가 지정되면 학교별 체크와 지부 드롭다운을 숨긴다", () => {
    render(
      <ApplicantFilterBar
        filters={DEFAULT_APPLICANT_LIST_FILTERS}
        onFiltersChange={() => {}}
        resultFilterLabel="서류 평가 결과"
        chapterScope="Ferrum"
      />,
    )

    expect(
      screen.queryByRole("checkbox", { name: "학교별 보기" }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "지부" }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "학교" })).toBeInTheDocument()
  })
})
