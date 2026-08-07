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

  it("hover-upload 상태에서 업로드 overlay를 표시한다", () => {
    render(
      <ProfileAvatar
        src="https://example.com/profile.png"
        alt="사용자 프로필"
        state="hover-upload"
      />,
    )

    expect(screen.getByAltText("사용자 프로필")).toBeInTheDocument()
    expect(screen.getByTestId("profile-avatar-upload")).toBeInTheDocument()
  })
})
