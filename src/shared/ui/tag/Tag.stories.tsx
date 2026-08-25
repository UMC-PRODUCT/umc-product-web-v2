import { Tag } from "./Tag"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Shared UI/Tag/Tag",
  component: Tag,
  tags: ["autodocs"],
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Tones: Story = {
  args: {
    children: "상태 태그",
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-5">
      <Tag tone="teal">진행 중</Tag>
      <Tag tone="gray">대기 중</Tag>
      <Tag tone="orange">주의</Tag>
      <Tag tone="red">오류</Tag>
    </div>
  ),
}

export const Default: Story = {
  args: {
    children: "상태 태그",
  },
}
