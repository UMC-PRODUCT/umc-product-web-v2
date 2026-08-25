import { RecruitStatusChip } from "./RecruitStatusChip"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Shared UI/Tag/RecruitStatusChip",
  component: RecruitStatusChip,
  tags: ["autodocs"],
} satisfies Meta<typeof RecruitStatusChip>

export default meta
type Story = StoryObj<typeof meta>

export const Recruiting: Story = {
  args: {
    done: false,
  },
}

export const Completed: Story = {
  args: {
    done: true,
  },
}

export const Sizes: Story = {
  args: {
    done: false,
  },
  render: () => (
    <div className="flex items-center gap-3">
      <RecruitStatusChip done={false} />
      <RecruitStatusChip done={false} size="md" />
      <RecruitStatusChip done size="md" />
    </div>
  ),
}
