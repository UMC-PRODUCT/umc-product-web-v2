import { type ComponentProps, useState } from "react"
import { expect, fn, screen } from "storybook/test"

import { Button } from "../Button"
import { CtaModal } from "./CtaModal"

import type { Meta, StoryObj } from "@storybook/react-vite"

function CtaModalDemo(props: ComponentProps<typeof CtaModal>) {
  const [open, setOpen] = useState(props.open)

  return (
    <div>
      <Button onClick={() => setOpen(true)}>모달 열기</Button>
      <CtaModal
        {...props}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          props.onOpenChange(nextOpen)
        }}
        onCancel={() => {
          setOpen(false)
          props.onCancel?.()
        }}
        onConfirm={() => {
          setOpen(false)
          props.onConfirm()
        }}
      />
    </div>
  )
}

const meta = {
  title: "Shared UI/Overlay/CtaModal",
  component: CtaModal,
  tags: ["autodocs"],
  args: {
    cancelText: "취소",
    confirmText: "확인",
    content: "이 작업을 진행하시겠습니까?",
    onCancel: fn(),
    onConfirm: fn(),
    onOpenChange: fn(),
    open: false,
    title: "작업 확인",
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof CtaModal>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {
  render: (args) => <CtaModalDemo {...args} />,
}

export const Open: Story = {
  args: {
    open: true,
    variant: "warning",
  },
  render: (args) => <CtaModalDemo {...args} />,
}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <CtaModalDemo
        cancelText="취소"
        confirmText="확인"
        content="성공 상태의 안내입니다."
        onConfirm={fn()}
        onOpenChange={fn()}
        open={false}
        title="성공"
        variant="success"
      />
      <CtaModalDemo
        cancelText="취소"
        confirmText="삭제"
        content="삭제한 내용은 되돌릴 수 없습니다."
        onConfirm={fn()}
        onOpenChange={fn()}
        open={false}
        title="삭제 확인"
        variant="error"
      />
    </div>
  ),
}

export const ConfirmLoading: Story = {
  args: {
    confirmLoading: true,
    open: true,
  },
  render: (args) => <CtaModalDemo {...args} />,
}

export const Interactive: Story = {
  render: (args) => <CtaModalDemo {...args} />,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "모달 열기" }))
    const dialog = await screen.findByRole("dialog")
    await expect(dialog).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: "확인" }))
    await expect(args.onConfirm).toHaveBeenCalledOnce()
  },
}
