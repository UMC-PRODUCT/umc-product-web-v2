import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PageLabel } from "./PageLabel"

describe("PageLabel", () => {
  it("페이지 여백을 강제하지 않고 호출자가 전달한 className을 적용한다", () => {
    const { container } = render(
      <PageLabel
        breadcrumb={[{ id: "document", label: "서류 평가" }]}
        title="서류 평가"
        description="지원자를 평가합니다."
        className="page-spacing"
      />,
    )

    expect(container.firstElementChild).toHaveClass("page-spacing")
    expect(container.firstElementChild).not.toHaveClass("pl-3")
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "서류 평가",
    )
    expect(screen.getByText("지원자를 평가합니다.")).toBeInTheDocument()
  })
})
