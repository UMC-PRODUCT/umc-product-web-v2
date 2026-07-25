import { DndContext } from "@dnd-kit/core"
import { SortableContext } from "@dnd-kit/sortable"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { CurriculumCardEditable } from "./CurriculumCardEditable"

import type { CurriculumItem } from "../model/curriculumData"

const TITLE_PLACEHOLDER = "커리큘럼 이름을 작성하세요"

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
  props: Partial<React.ComponentProps<typeof CurriculumCardEditable>> = {},
) {
  const curriculum = props.curriculum ?? buildCurriculum()
  return render(
    <DndContext>
      <SortableContext items={[curriculum.id]}>
        <CurriculumCardEditable curriculum={curriculum} {...props} />
      </SortableContext>
    </DndContext>,
  )
}

describe("CurriculumCardEditable", () => {
  it("제목을 입력으로 편집할 수 있다", () => {
    const onUpdateCurriculumTitle = vi.fn()
    renderCard({ onUpdateCurriculumTitle })

    const input = screen.getByPlaceholderText(TITLE_PLACEHOLDER)
    expect(input).toHaveValue("Figma 기초")

    fireEvent.change(input, { target: { value: "Figma 심화" } })
    expect(onUpdateCurriculumTitle).toHaveBeenCalledWith("Figma 심화")
  })

  it("워크북 추가 버튼을 노출한다", () => {
    const onAddWorkbook = vi.fn()
    renderCard({ onAddWorkbook })

    fireEvent.click(screen.getByRole("button", { name: "워크북" }))

    expect(onAddWorkbook).toHaveBeenCalled()
  })

  it("제목이 비어 있으면 번호를 00으로 대체한다", () => {
    renderCard({ curriculum: buildCurriculum({ title: "" }) })

    expect(screen.getByText("00")).toBeInTheDocument()
  })

  it("워크북 제목과 미션을 입력으로 편집할 수 있다", () => {
    const onUpdateWorkbookTitle = vi.fn()
    const onUpdateMission = vi.fn()
    renderCard({ onUpdateWorkbookTitle, onUpdateMission })

    fireEvent.change(screen.getByPlaceholderText("워크북 이름을 작성하세요"), {
      target: { value: "Fill 익히기" },
    })
    expect(onUpdateWorkbookTitle).toHaveBeenCalledWith(0, "Fill 익히기")

    const missionInputs = screen.getAllByPlaceholderText("미션을 작성하세요")
    fireEvent.change(missionInputs[0] as HTMLElement, {
      target: { value: "Frame 개념 알기" },
    })
    expect(onUpdateMission).toHaveBeenCalledWith(0, 0, "Frame 개념 알기")
  })

  it("펼치기 토글 없이 워크북을 항상 노출한다", () => {
    renderCard()

    expect(
      screen.getAllByPlaceholderText("미션을 작성하세요").length,
    ).toBeGreaterThan(0)
  })

  it("미션 입력에서 Enter를 누르면 다음 미션을 추가한다", () => {
    const onAddMission = vi.fn()
    renderCard({ onAddMission })

    const missionInputs = screen.getAllByPlaceholderText("미션을 작성하세요")
    fireEvent.keyDown(missionInputs[0] as HTMLElement, { key: "Enter" })

    expect(onAddMission).toHaveBeenCalledWith(0, 0)
  })

  it("빈 미션에서 Backspace를 누르면 해당 미션을 제거한다", () => {
    const onRemoveMission = vi.fn()
    renderCard({
      curriculum: buildCurriculum({
        workbooks: [
          {
            id: "wb1",
            number: 1,
            title: "Hug 익히기",
            missions: ["", "미션 B"],
          },
        ],
      }),
      onRemoveMission,
    })

    const missionInputs = screen.getAllByPlaceholderText("미션을 작성하세요")
    fireEvent.keyDown(missionInputs[0] as HTMLElement, { key: "Backspace" })

    expect(onRemoveMission).toHaveBeenCalledWith(0, 0)
  })

  it("미션이 하나뿐이면 Backspace로 제거하지 않는다", () => {
    const onRemoveMission = vi.fn()
    renderCard({
      curriculum: buildCurriculum({
        workbooks: [
          { id: "wb1", number: 1, title: "Hug 익히기", missions: [""] },
        ],
      }),
      onRemoveMission,
    })

    const missionInputs = screen.getAllByPlaceholderText("미션을 작성하세요")
    fireEvent.keyDown(missionInputs[0] as HTMLElement, { key: "Backspace" })

    expect(onRemoveMission).not.toHaveBeenCalled()
  })
})
