import { DndContext } from "@dnd-kit/core"
import { SortableContext } from "@dnd-kit/sortable"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { CurriculumCard } from "./CurriculumCard"

import type { CurriculumItem } from "../model/curriculumData"

const TITLE_PLACEHOLDER = "커리큘럼 이름을 작성하세요"

function buildCurriculum(overrides: Partial<CurriculumItem> = {}) {
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
  } satisfies CurriculumItem
}

function renderCard(
  props: Partial<React.ComponentProps<typeof CurriculumCard>> = {},
) {
  const curriculum = props.curriculum ?? buildCurriculum()
  return render(
    <DndContext>
      <SortableContext items={[curriculum.id]}>
        <CurriculumCard curriculum={curriculum} isExpanded={false} {...props} />
      </SortableContext>
    </DndContext>,
  )
}

describe("CurriculumCard 조회 모드", () => {
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
      screen.queryByPlaceholderText(TITLE_PLACEHOLDER),
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
})

describe("CurriculumCard 편집 모드", () => {
  it("제목을 입력으로 편집할 수 있다", () => {
    const onUpdateCurriculumTitle = vi.fn()
    renderCard({ isEditable: true, onUpdateCurriculumTitle })

    const input = screen.getByPlaceholderText(TITLE_PLACEHOLDER)
    expect(input).toHaveValue("Figma 기초")

    fireEvent.change(input, { target: { value: "Figma 심화" } })
    expect(onUpdateCurriculumTitle).toHaveBeenCalledWith("Figma 심화")
  })

  it("워크북 추가 버튼을 노출한다", () => {
    const onAddWorkbook = vi.fn()
    renderCard({ isEditable: true, onAddWorkbook })

    fireEvent.click(screen.getByRole("button", { name: "워크북" }))

    expect(onAddWorkbook).toHaveBeenCalled()
  })

  it("제목이 비어 있으면 번호를 00으로 대체한다", () => {
    renderCard({
      isEditable: true,
      curriculum: buildCurriculum({ title: "" }),
    })

    expect(screen.getByText("00")).toBeInTheDocument()
  })
})
