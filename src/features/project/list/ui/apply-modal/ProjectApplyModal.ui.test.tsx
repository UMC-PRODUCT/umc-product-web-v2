import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { AxiosError } from "axios"
import { createRef } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getActiveGisu } from "@/shared/api/gisu"

import {
  createApplicationDraft,
  getApplicationDetail,
  getMyApplications,
} from "../../api/matchingProject"
import {
  ProjectApplyModal,
  type ProjectApplyModalHandle,
} from "./ProjectApplyModal"

import type { MatchingProject } from "@/features/project/list/model/matchingProject"
import type { Section } from "@/features/project/new/model/applicationQuestion"

vi.mock("@/features/auth/hooks/useResourcePermission", () => ({
  useResourcePermission: () => ({ isPending: false }),
}))

vi.mock("@/shared/api/gisu", () => ({
  getActiveGisu: vi.fn(),
}))

vi.mock("../../api/matchingProject", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api/matchingProject")>()),
  createApplicationDraft: vi.fn(),
  getMyApplications: vi.fn(),
  getApplicationDetail: vi.fn(),
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

describe("ProjectApplyModal draft hydration", () => {
  it("기존 DRAFT가 있으면 스켈레톤 이후 저장된 답변을 복원한다", async () => {
    const conflict = new AxiosError(
      "conflict",
      "ERR_CONFLICT",
      undefined,
      undefined,
      { status: 409 } as never,
    )
    vi.mocked(createApplicationDraft).mockRejectedValue(conflict)
    vi.mocked(getActiveGisu).mockResolvedValue({ gisuId: 10 } as never)
    vi.mocked(getMyApplications).mockResolvedValue([
      {
        projectId: "1",
        status: "DRAFT",
        applicationId: "9",
        matchingRound: { id: "1" },
      },
    ] as never)
    vi.mocked(getApplicationDetail).mockResolvedValue({
      applicationId: "9",
      status: "DRAFT",
      formResponse: {
        sections: [
          {
            sectionId: "common",
            questions: [
              {
                questionId: "101",
                type: "RADIO",
                answer: {
                  answerId: "1",
                  answeredAsType: "RADIO",
                  selectedOptions: [
                    { questionOptionId: "1002", answeredAsContent: "두 번째" },
                  ],
                },
              },
            ],
          },
        ],
      },
    } as never)

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

    const secondOption = await screen.findByRole("radio", { name: "두 번째" })
    await waitFor(() => {
      expect(secondOption).toHaveAttribute("aria-checked", "true")
    })
    expect(screen.getByRole("radio", { name: "첫 번째" })).toHaveAttribute(
      "aria-checked",
      "false",
    )
  })
})

const textSections: Section[] = [
  {
    id: "common",
    name: "공통 문항",
    isEnabled: true,
    questions: [
      {
        id: "201",
        title: "자기소개",
        caption: "",
        fieldType: "text",
        required: false,
        options: [],
      },
    ],
  },
]

describe("ProjectApplyModal requestClose (배경 클릭/ESC)", () => {
  it("변경사항이 있으면 이탈 확인 모달을 띄운다", async () => {
    vi.stubEnv("VITE_DEV_MATCHING_ROUND_ID", "1")
    const ref = createRef<ProjectApplyModalHandle>()
    const onBack = vi.fn()

    render(
      <ProjectApplyModal
        ref={ref}
        data={project}
        projectId={1}
        matchingRoundId={1}
        sections={textSections}
        onBack={onBack}
        onSubmitSuccess={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "지원 동기 작성 중" },
    })
    act(() => {
      ref.current?.requestClose()
    })

    expect(await screen.findByText("페이지 이탈")).toBeInTheDocument()
    expect(onBack).not.toHaveBeenCalled()
  })

  it("변경사항이 없으면 확인 없이 바로 닫는다", () => {
    vi.stubEnv("VITE_DEV_MATCHING_ROUND_ID", "1")
    const ref = createRef<ProjectApplyModalHandle>()
    const onBack = vi.fn()

    render(
      <ProjectApplyModal
        ref={ref}
        data={project}
        projectId={1}
        matchingRoundId={1}
        sections={sections}
        onBack={onBack}
        onSubmitSuccess={vi.fn()}
      />,
    )

    act(() => {
      ref.current?.requestClose()
    })

    expect(onBack).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("페이지 이탈")).not.toBeInTheDocument()
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  if (!originalScrollIntoView) {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView")
  }
})
