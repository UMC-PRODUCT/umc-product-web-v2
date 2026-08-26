import { expect, fn, screen } from "storybook/test"

import { RecruitmentApplyConfirmModal } from "./RecruitmentApplyConfirmModal"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Feature/Recruiting/RecruitmentApplyConfirmModal",
  component: RecruitmentApplyConfirmModal,
  tags: ["autodocs"],
  args: {
    confirmLoading: false,
    onConfirm: fn(),
    onOpenChange: fn(),
    open: true,
    recruitmentTitle: "UMC 11기 이화여대",
    status: "confirm",
  },
  parameters: {
    routePath: "/projects/notice",
  },
} satisfies Meta<typeof RecruitmentApplyConfirmModal>

export default meta
type Story = StoryObj<typeof meta>

export const Confirm: Story = {}

export const Draft: Story = {
  args: {
    status: "draft",
  },
}

export const Submitted: Story = {
  args: {
    status: "submitted",
  },
}

export const SubmittedEditable: Story = {
  args: {
    status: "submittedEditable",
  },
}

export const Loading: Story = {
  args: {
    confirmLoading: true,
  },
}

export const Interactive: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(screen.getByRole("button", { name: "지원하기" }))
    await expect(args.onConfirm).toHaveBeenCalledOnce()
  },
}
