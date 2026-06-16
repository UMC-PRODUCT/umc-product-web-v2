import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { RecruitQuestionsViewModal } from "./RecruitQuestionsViewModal"

import type { MatchingProject } from "@/features/project/list/model/matchingProject"
import type { Section } from "@/features/project/new/model/applicationQuestion"

const project: MatchingProject = {
  id: "1",
  branch: "중앙",
  school: "동덕여자대학교",
  title: "테스트 프로젝트",
  description: "프로젝트 설명",
  authorSchoolLine: "동덕여자대학교",
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
        title: "지원 동기를 작성해주세요",
        caption: "500자 이내로 작성해주세요",
        fieldType: "text",
        required: true,
        options: [],
      },
      {
        id: "102",
        title: "설명이 없는 질문",
        caption: "",
        fieldType: "text",
        required: false,
        options: [],
      },
    ],
  },
]

describe("RecruitQuestionsViewModal", () => {
  it("질문에 설명(caption)이 있으면 제목 아래에 함께 표시한다", () => {
    render(<RecruitQuestionsViewModal data={project} sections={sections} />)

    expect(screen.getByText("지원 동기를 작성해주세요")).toBeInTheDocument()
    expect(screen.getByText("500자 이내로 작성해주세요")).toBeInTheDocument()
    expect(screen.getByText("설명이 없는 질문")).toBeInTheDocument()
  })
})
