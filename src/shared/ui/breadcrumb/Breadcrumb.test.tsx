import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { ComponentPropsWithoutRef } from "react"

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, ...props }: ComponentPropsWithoutRef<"a"> & { to: string }) => (
    <a {...props} href={to} />
  ),
}))

import { Breadcrumb } from "./Breadcrumb"

describe("Breadcrumb", () => {
  it("항목을 nav, ol, li 구조로 렌더한다", () => {
    render(
      <Breadcrumb
        items={[
          { id: "recruiting", label: "리크루팅" },
          { id: "evaluation", label: "평가 관리" },
          { id: "document", label: "서류 평가" },
        ]}
      />,
    )

    const navigation = screen.getByRole("navigation", { name: "breadcrumb" })
    const list = within(navigation).getByRole("list")

    expect(within(list).getAllByRole("listitem")).toHaveLength(3)
  })

  it("마지막 항목에 현재 위치를 표시하고 링크를 비활성화한다", () => {
    render(
      <Breadcrumb
        items={[
          { id: "recruiting", label: "리크루팅", to: "/recruiting" },
          {
            id: "evaluation",
            label: "평가 관리",
            to: "/recruiting/evaluations",
          },
        ]}
      />,
    )

    expect(screen.getByRole("link", { name: "리크루팅" })).toHaveAttribute(
      "href",
      "/recruiting",
    )
    expect(
      screen.queryByRole("link", { name: "평가 관리" }),
    ).not.toBeInTheDocument()
    expect(screen.getByText("평가 관리")).toHaveAttribute(
      "aria-current",
      "page",
    )
  })
})
