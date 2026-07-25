import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { CurriculumCardReadonly } from "./CurriculumCardReadonly"

import type { CurriculumItem } from "../model/curriculumData"

function buildCurriculum(
  overrides: Partial<CurriculumItem> = {},
): CurriculumItem {
  return {
    id: "c1",
    number: "01",
    title: "Figma 기초",
    workbookCount: 2,
    missionCount: 5,
    workbooks: [
      {
        id: "wb1",
        number: 1,
        title: "Hug 익히기",
        missions: ["미션 A", "미션 B"],
      },
    ],
    ...overrides,
  }
}

function renderCard(
  props: Partial<React.ComponentProps<typeof CurriculumCardReadonly>> = {},
) {
  return render(
    <CurriculumCardReadonly
      curriculum={buildCurriculum()}
      isExpanded={false}
      {...props}
    />,
  )
}

describe("CurriculumCardReadonly", () => {
  it("번호와 제목, 구성 요약을 보여준다", () => {
    const { container } = renderCard()

    expect(screen.getByText("01")).toBeInTheDocument()
    expect(screen.getByText("Figma 기초")).toBeInTheDocument()
    expect(container.textContent).toContain("워크북 2개")
    expect(container.textContent).toContain("미션 5개")
  })

  it("제목을 입력 필드로 노출하지 않는다", () => {
    renderCard()

    expect(
      screen.queryByPlaceholderText("커리큘럼 이름을 작성하세요"),
    ).not.toBeInTheDocument()
  })

  it("펼치기 토글을 키보드로 조작할 수 있다", () => {
    const onToggleExpand = vi.fn()
    renderCard({ onToggleExpand })

    fireEvent.keyDown(screen.getAllByRole("button")[0] as HTMLElement, {
      key: "Enter",
    })

    expect(onToggleExpand).toHaveBeenCalled()
  })

  it("수정 버튼은 펼치기 토글을 함께 실행하지 않는다", () => {
    const onEdit = vi.fn()
    const onToggleExpand = vi.fn()
    renderCard({ onEdit, onToggleExpand })

    fireEvent.click(screen.getByRole("button", { name: "수정" }))

    expect(onEdit).toHaveBeenCalled()
    expect(onToggleExpand).not.toHaveBeenCalled()
  })

  it("펼친 상태에서는 워크북과 미션을 보여준다", () => {
    renderCard({ isExpanded: true })

    expect(screen.getByText("Hug 익히기")).toBeInTheDocument()
    expect(screen.getByText("미션 A")).toBeInTheDocument()
  })

  it("수정 버튼에서 Enter를 눌러도 펼치기 토글이 실행되지 않는다", () => {
    const onToggleExpand = vi.fn()
    renderCard({ onEdit: vi.fn(), onToggleExpand })

    fireEvent.keyDown(screen.getByRole("button", { name: "수정" }), {
      key: "Enter",
    })

    expect(onToggleExpand).not.toHaveBeenCalled()
  })
})
