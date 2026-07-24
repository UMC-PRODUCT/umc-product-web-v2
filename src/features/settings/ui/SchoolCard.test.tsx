import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { SchoolCard } from "./SchoolCard"

describe("SchoolCard", () => {
  it("지부명·학교명·인원을 표시한다", () => {
    render(<SchoolCard branch="Chromium" name="가가대학교" count={127} />)

    expect(screen.getByText("Chromium")).toBeInTheDocument()
    expect(screen.getByText("가가대학교")).toBeInTheDocument()
    expect(screen.getByText("총 127명")).toBeInTheDocument()
  })

  it("레이아웃 이동 없이 Hover 테두리를 적용한다", () => {
    const { container } = render(
      <SchoolCard branch="Chromium" name="가가대학교" count={127} />,
    )
    const card = container.firstElementChild as HTMLElement

    expect(card).toHaveClass("border", "border-transparent")
    expect(card).toHaveClass("hover:border-teal-gray-200")
  })
})
