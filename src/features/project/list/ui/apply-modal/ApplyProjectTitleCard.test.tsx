import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ApplyProjectTitleCard } from "./ApplyProjectTitleCard"

describe("ApplyProjectTitleCard", () => {
  it("logoSrc가 있으면 프로젝트 로고 이미지를 렌더한다", () => {
    render(
      <ApplyProjectTitleCard
        projectName="테스트 프로젝트"
        logoSrc="https://example.com/logo.png"
      />,
    )

    const img = screen.getByAltText("project logo")
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute("src", "https://example.com/logo.png")
  })

  it("logoSrc가 없으면 이미지 대신 fallback을 렌더한다", () => {
    render(<ApplyProjectTitleCard projectName="테스트 프로젝트" />)

    expect(screen.queryByAltText("project logo")).not.toBeInTheDocument()
  })
})
