import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ExpandableTableHead } from "./ExpandableTableHead"

describe("ExpandableTableHead", () => {
  it("자식과 전달된 스타일을 렌더링한다", () => {
    render(
      <ExpandableTableHead className="gap-2.5">
        <span>지원자</span>
      </ExpandableTableHead>,
    )

    expect(screen.getByText("지원자").parentElement).toHaveClass(
      "h-10",
      "gap-2.5",
      "bg-teal-100",
    )
    expect(screen.getByRole("row")).toBeInTheDocument()
  })

  it("토글 핸들러가 없으면 전체 펼치기 버튼을 숨긴다", () => {
    render(
      <ExpandableTableHead>
        <span>지원자</span>
      </ExpandableTableHead>,
    )

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("펼침 상태에 맞는 라벨을 표시하고 토글 핸들러를 호출한다", () => {
    const onToggle = vi.fn()
    const { rerender } = render(
      <ExpandableTableHead onToggle={onToggle}>
        <span>지원자</span>
      </ExpandableTableHead>,
    )

    const expandButton = screen.getByRole("button", { name: "모두 펼치기" })
    expect(expandButton).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(expandButton)
    expect(onToggle).toHaveBeenCalledOnce()

    rerender(
      <ExpandableTableHead expanded onToggle={onToggle}>
        <span>지원자</span>
      </ExpandableTableHead>,
    )

    expect(screen.getByRole("button", { name: "모두 접기" })).toHaveAttribute(
      "aria-expanded",
      "true",
    )
  })
})
