import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ProjectApplyModal } from "./ProjectApplyModal"

import type { MatchingProject } from "@/features/project/list/model/matchingProject"
import type { Section } from "@/features/project/new/model/applicationQuestion"

vi.mock("@/features/auth/hooks/useResourcePermission", () => ({
  useResourcePermission: () => ({ isPending: false }),
}))

const originalScrollIntoView = HTMLElement.prototype.scrollIntoView

const project: MatchingProject = {
  id: "1",
  branch: "중앙",
  school: "테스트대학교",
  title: "테스트 프로젝트",
  description: "테스트 프로젝트 설명",
  authorSchoolLine: "테스트대학교",
  recruitRows: [{ part: "프론트엔드", current: 0, total: 1 }],
}

const sections: Section[] = [
  {
    id: "common",
    name: "공통 문항",
    isEnabled: true,
    questions: [
      {
        id: "101",
        title: "단일 선택",
        caption: "",
        fieldType: "radio",
        required: true,
        options: [
          { content: "첫 번째", optionId: 1001 },
          { content: "두 번째", optionId: 1002 },
        ],
      },
    ],
  },
]

beforeEach(() => {
  if (!originalScrollIntoView) {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: () => undefined,
    })
  }
  vi.spyOn(HTMLElement.prototype, "scrollIntoView").mockImplementation(vi.fn())
})

describe("ProjectApplyModal radio answer", () => {
  it("선택된 단일 선택지를 다시 누르면 선택을 해제한다", async () => {
    vi.stubEnv("VITE_DEV_MATCHING_ROUND_ID", "1")

    render(
      <ProjectApplyModal
        data={project}
        projectId={1}
        matchingRoundId={1}
        sections={sections}
        onBack={vi.fn()}
        onSubmitSuccess={vi.fn()}
      />,
    )

    const firstOption = screen.getByRole("radio", { name: "첫 번째" })

    fireEvent.click(firstOption)
    expect(firstOption).toHaveAttribute("aria-checked", "true")

    fireEvent.click(firstOption)
    expect(firstOption).toHaveAttribute("aria-checked", "false")

    fireEvent.click(screen.getByRole("button", { name: "제출하기" }))

    await waitFor(() => {
      expect(screen.getByText("선택해 주세요.")).toBeInTheDocument()
    })
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  if (!originalScrollIntoView) {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView")
  }
})
