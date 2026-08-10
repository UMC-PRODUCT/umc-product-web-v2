import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CounterLabel } from "./CounterLabel"

describe("CounterLabel", () => {
  it.each([
    ["xs", "text-caption-2-regular", ["text-caption-2-regular"]],
    ["sm", "text-body-2-medium", ["text-body-2-regular"]],
    ["md", "text-body-1-medium", ["text-body-1-regular"]],
    [
      "lg",
      "text-subtitle-1-medium",
      ["text-subtitle-1-medium", "font-normal!"],
    ],
  ] as const)(
    "%s 크기에서 숫자와 슬래시의 피그마 텍스트 토큰을 적용한다",
    (size, numberClass, slashClasses) => {
      render(<CounterLabel current={3} total={10} size={size} />)

      expect(screen.getByText("3")).toHaveClass(numberClass)
      expect(screen.getByText("/")).toHaveClass(...slashClasses)
      expect(screen.getByText("10")).toHaveClass(numberClass)
    },
  )

  it("기본 상태에서는 모든 숫자에 기존 중립 색상을 유지한다", () => {
    render(<CounterLabel current={3} total={10} />)

    expect(screen.getByText("3")).not.toHaveClass("text-teal-500")
    expect(screen.getByText("/")).not.toHaveClass("text-teal-500")
    expect(screen.getByText("10")).not.toHaveClass("text-teal-500")
  })

  it("현재 값 강조 상태에서는 현재 값만 강조한다", () => {
    render(<CounterLabel current={3} total={10} emphasis="current" />)

    expect(screen.getByText("3")).toHaveClass("text-teal-500")
    expect(screen.getByText("/")).toHaveClass("text-teal-gray-600")
    expect(screen.getByText("10")).toHaveClass("text-teal-gray-600")
  })
})
