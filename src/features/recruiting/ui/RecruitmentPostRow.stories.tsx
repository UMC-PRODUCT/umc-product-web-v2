import { fn } from "storybook/test"

import { RecruitmentPostRow } from "./RecruitmentPostRow"

import type { Meta, StoryObj } from "@storybook/react-vite"

import type { RecruitmentPostStatus } from "../model/recruitmentList"

const manageAction = (label: string, onClick: () => void = fn()) => (
  <button type="button" aria-label={label} onClick={onClick}>
    {label}
  </button>
)

const meta = {
  title: "Feature/Recruiting/RecruitmentPostRow",
  component: RecruitmentPostRow,
  tags: ["autodocs"],
  args: {
    editable: true,
    endLabel: "2026.04.30 23:59",
    startLabel: "2026.04.01 00:00",
    status: "OPEN" as RecruitmentPostStatus,
    title: "UMC 11기 챌린저 모집 공고",
  },
  parameters: {
    layout: "centered",
    routePath: "/recruiting/recruitments",
  },
} satisfies Meta<typeof RecruitmentPostRow>

export default meta
type Story = StoryObj<typeof meta>

export const Recruiting: Story = {}

export const Closed: Story = {
  args: {
    status: "CLOSED",
  },
}

export const Draft: Story = {
  args: {
    dateLabel: "2026.03.20 14:00",
    endLabel: undefined,
    startLabel: undefined,
    status: "DRAFT",
    title: "작성 중인 모집 공고",
  },
}

export const LongTitle: Story = {
  args: {
    title:
      "UMC 11기와 함께 제품을 만들며 성장할 챌린저를 모집하는 긴 제목의 공고",
  },
}

export const CustomAction: Story = {
  args: {
    rightAction: manageAction("공고 관리"),
  },
}
