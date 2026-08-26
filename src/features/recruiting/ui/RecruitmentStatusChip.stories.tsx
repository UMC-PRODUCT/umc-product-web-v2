import { RecruitmentStatusChip } from "./RecruitmentStatusChip"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Feature/Recruiting/RecruitmentStatusChip",
  component: RecruitmentStatusChip,
  tags: ["autodocs"],
  args: {
    done: false,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof RecruitmentStatusChip>

export default meta
type Story = StoryObj<typeof meta>

export const Recruiting: Story = {}

export const Closed: Story = {
  args: {
    done: true,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <RecruitmentStatusChip done={false} />
      <RecruitmentStatusChip done={false} size="md" />
      <RecruitmentStatusChip done size="md" />
    </div>
  ),
}
