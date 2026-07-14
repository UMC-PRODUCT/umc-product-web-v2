import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Tooltip } from "./Tooltip"

function Trigger() {
  return <button type="button">도움말</button>
}

describe("Tooltip", () => {
  it("밝은 큰 Tooltip에서 라벨과 본문을 피그마 토큰으로 표시한다", () => {
    render(
      <Tooltip
        label="라벨"
        content="사용자에게 정보를 안내합니다."
        size="big"
        dark={false}
        defaultOpen
      >
        <Trigger />
      </Tooltip>,
    )

    const tooltip = screen.getByRole("tooltip")

    expect(screen.getByText("라벨")).toHaveClass(
      "text-caption-3-bold",
      "text-teal-600",
    )
    expect(screen.getByText("사용자에게 정보를 안내합니다.")).toHaveClass(
      "text-caption-3-regular",
      "text-left",
    )
    expect(tooltip).toHaveClass("shadow-drop-neutral-1")
  })

  it("라벨이 지원되지 않는 조합에서는 본문만 표시한다", () => {
    render(
      <Tooltip label="라벨" content="Tooltips" size="small" defaultOpen>
        <Trigger />
      </Tooltip>,
    )

    expect(screen.queryByText("라벨")).not.toBeInTheDocument()
    expect(screen.getByText("Tooltips")).toHaveClass("text-center")
  })

  it("클릭하면 Tooltip을 열고 다시 클릭하면 닫는다", () => {
    render(
      <Tooltip content="Tooltips" delayDuration={0}>
        <Trigger />
      </Tooltip>,
    )

    const trigger = screen.getByRole("button", { name: "도움말" })

    fireEvent.click(trigger)
    expect(screen.getByRole("tooltip")).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })

  it("Tooltip 바깥을 누르면 열린 Tooltip을 닫는다", () => {
    render(
      <>
        <Tooltip content="Tooltips" delayDuration={0}>
          <Trigger />
        </Tooltip>
        <button type="button">바깥</button>
      </>,
    )

    fireEvent.click(screen.getByRole("button", { name: "도움말" }))
    expect(screen.getByRole("tooltip")).toBeInTheDocument()

    fireEvent.pointerDown(screen.getByRole("button", { name: "바깥" }))
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })
})
