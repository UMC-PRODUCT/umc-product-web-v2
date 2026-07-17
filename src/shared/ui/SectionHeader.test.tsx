import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { SectionHeader } from "./SectionHeader"

describe("SectionHeader", () => {
  it("필수 index를 두 자리로 표시한다", () => {
    render(<SectionHeader index={3} title="지원자 목록" />)

    expect(screen.getByText("03")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "03지원자 목록",
    )
  })

  it("지정한 heading level을 사용한다", () => {
    render(<SectionHeader index={12} title="매칭 결과" level={2} />)

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "12매칭 결과",
    )
  })
})
