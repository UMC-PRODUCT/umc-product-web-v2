import { expect, fn } from "storybook/test"

import { Toast } from "./Toast"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Shared UI/Feedback/Toast",
  component: Toast,
  tags: ["autodocs"],
  args: {
    isDismissing: false,
    message: "변경사항이 저장되었습니다.",
    onDismiss: fn(),
    remaining: 3000,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Error: Story = {
  args: {
    color: "red",
    message: "저장에 실패했습니다.",
  },
}

export const Weak: Story = {
  args: {
    variant: "weak",
  },
}

export const Timed: Story = {
  args: {
    remaining: 2500,
    type: "time",
  },
}

export const Notice: Story = {
  args: {
    message: "리크루팅 서비스는 준비 중입니다.",
    type: "notice",
  },
}

export const Action: Story = {
  args: {
    action: {
      label: "실행 취소",
      onClick: fn(),
    },
    message: "지원이 취소되었습니다.",
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "실행 취소" }))
    await expect(args.action?.onClick).toHaveBeenCalledOnce()
    await expect(args.onDismiss).toHaveBeenCalledOnce()
  },
}

export const Dismissible: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "토스트 닫기" }))
    await expect(args.onDismiss).toHaveBeenCalledOnce()
  },
}
