import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button } from "./Button"

describe("Button", () => {
  it("variant 생략 시 red loading 버튼도 기본값(fill)을 해석해 loading 배경을 적용한다", () => {
    render(
      <Button color="red" isLoading>
        버튼
      </Button>,
    )

    expect(screen.getByRole("button")).toHaveClass("bg-error-700")
  })

  it("weak red loading 버튼은 bg-error-200 loading 배경을 적용한다", () => {
    render(
      <Button color="red" variant="weak" isLoading>
        버튼
      </Button>,
    )

    expect(screen.getByRole("button")).toHaveClass("bg-error-200")
  })

  it("variant/color 생략 시 기본 primary fill loading 배경을 적용한다", () => {
    render(<Button isLoading>버튼</Button>)

    expect(screen.getByRole("button")).toHaveClass("bg-teal-700")
  })
})
