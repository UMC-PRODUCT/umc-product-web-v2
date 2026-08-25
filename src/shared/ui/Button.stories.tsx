import { expect, fn } from "storybook/test"

import { Button } from "./Button"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Shared UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "확인",
  },
}

export const ColorAndVariant: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button color="primary">Primary</Button>
      <Button color="neutral">Neutral</Button>
      <Button color="red">Red</Button>
      <Button variant="weak" color="primary">
        Weak primary
      </Button>
      <Button variant="weak" color="neutral">
        Weak neutral
      </Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">XS</Button>
      <Button size="s">S</Button>
      <Button size="m">M</Button>
      <Button size="lg">LG</Button>
      <Button size="xl">XL</Button>
    </div>
  ),
}

export const Icon: Story = {
  args: {
    children: "추가하기",
    icon: true,
  },
}

export const Disabled: Story = {
  args: {
    children: "비활성화",
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    children: "저장하기",
    isLoading: true,
  },
}

export const Interactive: Story = {
  args: {
    children: "클릭하기",
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "클릭하기" }))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
