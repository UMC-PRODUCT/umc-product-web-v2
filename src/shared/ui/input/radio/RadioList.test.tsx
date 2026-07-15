import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { RadioList } from "./RadioList"

describe("RadioList", () => {
  it("선택 상태에서 피그마의 Medium 텍스트와 아이콘 슬롯을 렌더링한다", () => {
    render(
      <RadioList
        checked
        onChange={() => {}}
        trailingIcon={<svg data-testid="trailing-icon" />}
      >
        Radio button
      </RadioList>,
    )

    const radio = screen.getByRole("radio", { name: "Radio button" })
    const label = screen.getByText("Radio button", {
      selector: ".text-body-1-medium",
    })

    expect(radio).toHaveClass("bg-teal-50")
    expect(label).toHaveClass("text-body-1-medium", "text-teal-600")
    expect(screen.getByTestId("trailing-icon")).toBeInTheDocument()
  })

  it("비활성 상태에서는 변경 이벤트를 발생시키지 않고 피그마의 Disabled 텍스트를 적용한다", () => {
    const onChange = vi.fn()

    render(
      <RadioList checked={false} onChange={onChange} disabled>
        Radio button
      </RadioList>,
    )

    const radio = screen.getByRole("radio", { name: "Radio button" })

    fireEvent.click(radio)

    expect(radio).toBeDisabled()
    expect(screen.getByText("Radio button")).toHaveClass(
      "text-body-1-regular",
      "text-teal-gray-400",
    )
    expect(onChange).not.toHaveBeenCalled()
  })
})
