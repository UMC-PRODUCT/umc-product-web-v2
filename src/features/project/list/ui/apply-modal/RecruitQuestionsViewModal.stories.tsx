import { RecruitQuestionsViewModal } from "./RecruitQuestionsViewModal"

import type { Meta, StoryObj } from "@storybook/react-vite"

import type { MatchingProject } from "@/entities/project/model/matchingProject"
import type { Section } from "@/features/project/new/model/applicationQuestion"

const project = {
  authorSchoolLine: "이화여대 · UMC 11기",
  branch: "Ferrum",
  description:
    "실제 사용자의 문제를 발견하고, 작은 실험을 반복하며 서비스를 함께 만들어 갈 팀원을 모집합니다.",
  id: "project-1",
  logoImage: null,
  recruitRows: [
    { current: 1, part: "PM", total: 2 },
    { current: 2, part: "Design", total: 2 },
    { current: 1, part: "Web PE", total: 3 },
  ],
  school: "이화여대",
  title: "캠퍼스 생활을 바꾸는 서비스",
} satisfies MatchingProject

const sections = [
  {
    id: "common",
    isEnabled: true,
    name: "공통",
    questions: [
      {
        caption: "지원자의 경험과 동기를 확인합니다.",
        fieldType: "text",
        id: "common-motivation",
        options: [],
        required: true,
        title: "이번 프로젝트에 지원한 이유를 알려주세요.",
      },
    ],
  },
  {
    id: "web",
    isEnabled: true,
    name: "Web PE",
    questions: [
      {
        caption: "가장 자신 있는 기술을 선택해 주세요.",
        fieldType: "radio",
        id: "web-skill",
        options: [
          { content: "React" },
          { content: "Vue" },
          { content: "기타" },
        ],
        required: true,
        title: "주로 사용하는 프론트엔드 기술은 무엇인가요?",
      },
    ],
  },
  {
    id: "design",
    isEnabled: false,
    name: "Design",
    questions: [
      {
        caption: "",
        fieldType: "portfolio",
        id: "design-portfolio",
        options: [],
        required: false,
        title: "포트폴리오",
      },
    ],
  },
] satisfies Section[]

const expandedSections = [
  ...sections,
  {
    id: "pm",
    isEnabled: true,
    name: "PM",
    questions: [
      {
        caption: "여러 개를 선택할 수 있습니다.",
        fieldType: "checkbox",
        id: "pm-experience",
        options: [
          { content: "기획" },
          { content: "리서치" },
          { content: "프로젝트 운영" },
        ],
        required: false,
        title: "경험해 본 업무를 모두 선택해 주세요.",
      },
    ],
  },
] satisfies Section[]

const meta = {
  title: "Feature/Recruiting/RecruitQuestionsViewModal",
  component: RecruitQuestionsViewModal,
  tags: ["autodocs"],
  args: {
    data: project,
    sections,
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof RecruitQuestionsViewModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongContent: Story = {
  args: {
    sections: expandedSections,
  },
}
