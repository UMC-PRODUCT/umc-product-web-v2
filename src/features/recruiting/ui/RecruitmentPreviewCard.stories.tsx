import { type ComponentProps, useState } from "react"
import { expect, fn } from "storybook/test"

import { RecruitmentPreviewCard } from "./RecruitmentPreviewCard"

import type { Meta, StoryObj } from "@storybook/react-vite"

function ControlledPreviewCard(
  props: ComponentProps<typeof RecruitmentPreviewCard>,
) {
  const [footer, setFooter] = useState(props.footer ?? "")

  return (
    <RecruitmentPreviewCard
      {...props}
      footer={footer}
      onFooterChange={(nextFooter) => {
        setFooter(nextFooter)
        props.onFooterChange?.(nextFooter)
      }}
    />
  )
}

const meta = {
  title: "Feature/Recruiting/RecruitmentPreviewCard",
  component: RecruitmentPreviewCard,
  tags: ["autodocs"],
  args: {
    endLabel: "2026.04.30 23:59",
    startLabel: "2026.04.01 00:00",
    title: "UMC 11기 모집",
  },
  parameters: {
    layout: "centered",
    routePath: "/recruiting/recruitments/new",
  },
} satisfies Meta<typeof RecruitmentPreviewCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    footer: "에서 함께 성장할 챌린저를 모집합니다.",
  },
}

export const EmptyFooter: Story = {
  args: {
    emptyFooterPlaceholder: "모집 안내 문구를 입력해 주세요.",
  },
}

export const Editable: Story = {
  args: {
    emptyFooterPlaceholder: "모집 안내 문구를 입력해 주세요.",
    footer: "에서 함께 성장할 챌린저를 모집합니다.",
    onFooterChange: fn(),
  },
  render: (args) => <ControlledPreviewCard {...args} />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "꼬릿말" })
    await userEvent.clear(input)
    await userEvent.type(input, "새로운 모집 안내")
    await expect(input).toHaveValue("새로운 모집 안내")
  },
}
