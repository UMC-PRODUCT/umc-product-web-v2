import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ProfileAvatar } from "./ProfileAvatar"

describe("ProfileAvatar", () => {
  it.each([40, 46, 100] as const)(
    "%dpx 피그마 크기 변형을 적용한다",
    (size) => {
      const { container } = render(<ProfileAvatar size={size} />)

      expect(container.firstChild).toHaveStyle({
        width: `${size}px`,
        height: `${size}px`,
      })
    },
  )

  it("이미지가 없으면 기본 프로필 아이콘을 표시한다", () => {
    const { container } = render(<ProfileAvatar />)

    expect(container.querySelector("svg")).toBeTruthy()
  })

  it("filled 상태에서 이미지를 표시한다", () => {
    render(
      <ProfileAvatar
        src="https://example.com/profile.png"
        alt="사용자 프로필"
        state="filled"
      />,
    )

    expect(screen.getByAltText("사용자 프로필")).toBeInTheDocument()
  })

  it("hover-upload 상태에서 피그마의 반투명 원형 상태를 표시한다", () => {
    render(
      <ProfileAvatar
        src="https://example.com/profile.png"
        alt="사용자 프로필"
        state="hover-upload"
      />,
    )

    const avatar = screen.getByTestId("profile-avatar-upload")
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveClass("border", "opacity-[0.34]")
    expect(screen.queryByAltText("사용자 프로필")).not.toBeInTheDocument()
  })

  it("기본 상태에서 크기에 맞춰 프로필 아이콘을 배치한다", () => {
    const { container } = render(<ProfileAvatar size={100} />)

    expect(container.querySelector("svg")).toHaveStyle({
      width: "87px",
      height: "87px",
      top: "17.39px",
    })
  })
})
