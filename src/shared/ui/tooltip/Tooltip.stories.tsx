import { expect, screen, userEvent } from "storybook/test"

import { Tooltip } from "./Tooltip"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Shared UI/Feedback/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    children: <button type="button">도움말</button>,
    content: "사용자에게 정보를 안내하는 설명입니다.",
    defaultOpen: true,
  },
}

export const ThemesAndSizes: Story = {
  args: {
    children: <button type="button">도움말</button>,
    content: "툴팁 내용",
  },
  render: () => (
    <div className="flex items-center gap-6">
      <Tooltip content="어두운 큰 툴팁" dark size="big">
        <button type="button">Dark / Big</button>
      </Tooltip>
      <Tooltip content="밝은 작은 툴팁" dark={false} size="small">
        <button type="button">Light / Small</button>
      </Tooltip>
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    children: <button type="button">도움말</button>,
    content: "마우스를 올리면 표시됩니다.",
    delayDuration: 0,
    hoverOnly: true,
  },
  play: async ({ canvas }) => {
    await userEvent.hover(canvas.getByRole("button", { name: "도움말" }))
    await expect(await screen.findByRole("tooltip")).toBeVisible()
  },
}
