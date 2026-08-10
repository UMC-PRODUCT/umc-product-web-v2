import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { ComponentPropsWithoutRef } from "react"

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    search,
    ...props
  }: ComponentPropsWithoutRef<"a"> & {
    to: string
    search?: { returnTo?: string }
  }) => {
    const returnTo = search?.returnTo
    const href = returnTo
      ? `${to}?returnTo=${encodeURIComponent(returnTo)}`
      : to
    return <a {...props} href={href} />
  },
}))

import { GuestProfileButton } from "./GuestProfileButton"

describe("GuestProfileButton", () => {
  it("현재 경로를 로그인 성공 후 이동 경로로 전달한다", () => {
    window.history.pushState({}, "", "/projects/apply/7?tab=notice#form")

    render(<GuestProfileButton />)

    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fprojects%2Fapply%2F7%3Ftab%3Dnotice%23form",
    )
  })

  it("모집 마감이면 로그인 버튼을 진한 색으로 표시한다", () => {
    render(<GuestProfileButton recruitingStatus={{ phase: "closed" }} />)

    expect(screen.getByRole("link", { name: "로그인" })).toHaveClass(
      "bg-teal-600",
      "text-white",
    )
  })
})
