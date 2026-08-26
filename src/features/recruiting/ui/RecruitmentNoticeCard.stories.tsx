import { expect, fn } from "storybook/test"

import { RecruitmentNoticeCard } from "./RecruitmentNoticeCard"

import type { Meta, StoryObj } from "@storybook/react-vite"

import type { PartTag } from "@/shared/model/domain"

const parts: PartTag[] = ["pm", "design", "web-pe"]
const logoUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='16' fill='%23D8F2EE'/%3E%3Cpath d='M22 52 39 18l19 34H22Z' fill='%230D9488'/%3E%3C/svg%3E"

const meta = {
  title: "Feature/Recruiting/RecruitmentNoticeCard",
  component: RecruitmentNoticeCard,
  tags: ["autodocs"],
  args: {
    dDay: 7,
    isClosed: false,
    onClick: fn(),
    parts,
    period: "2026.04.01 ~ 2026.04.30",
    title: "UMC 11기 챌린저 모집",
  },
  parameters: {
    layout: "centered",
    routePath: "/projects/notice",
  },
} satisfies Meta<typeof RecruitmentNoticeCard>

export default meta
type Story = StoryObj<typeof meta>

export const Recruiting: Story = {}

export const Closed: Story = {
  args: {
    dDay: undefined,
    isClosed: true,
  },
}

export const WithLogo: Story = {
  args: {
    logoUrl,
  },
}

export const Interactive: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button"))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
