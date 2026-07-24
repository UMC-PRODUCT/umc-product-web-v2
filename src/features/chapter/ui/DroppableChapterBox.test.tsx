import { DndContext } from "@dnd-kit/core"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DroppableChapterBox } from "./DroppableChapterBox"

import type { ChapterData } from "../model/chapterManagement"

function renderBox(chapter: ChapterData) {
  return render(
    <DndContext>
      <DroppableChapterBox
        chapter={chapter}
        selectedChipId={null}
        onSelectChip={vi.fn()}
        onClear={vi.fn()}
        onDelete={vi.fn()}
        onUpdateName={vi.fn(() => true)}
      />
    </DndContext>,
  )
}

describe("DroppableChapterBox", () => {
  it("배정된 학교 수를 표시한다", () => {
    const { container } = renderBox({
      id: "chapter-1",
      name: "Chromium",
      assignedSchools: [
        { id: "s1", name: "중앙대학교" },
        { id: "s2", name: "홍익대학교" },
      ],
    })

    expect(container.textContent).toContain("총 2개 학교")
  })

  it("배정된 학교가 없으면 0개와 안내 문구를 함께 표시한다", () => {
    const { container } = renderBox({
      id: "chapter-1",
      name: "Chromium",
      assignedSchools: [],
    })

    expect(container.textContent).toContain("총 0개 학교")
    expect(screen.getByText("소속된 학교가 없습니다")).toBeInTheDocument()
  })

  it("지부명이 비어 있으면 편집 종료 후 키보드로 접근 가능한 버튼을 노출한다", () => {
    renderBox({ id: "chapter-1", name: "", assignedSchools: [] })

    fireEvent.blur(screen.getByPlaceholderText("지부명을 입력해주세요"))

    expect(
      screen.getByRole("button", { name: "지부명 입력" }),
    ).toBeInTheDocument()
  })
})
