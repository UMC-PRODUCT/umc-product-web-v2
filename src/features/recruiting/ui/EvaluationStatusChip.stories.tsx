import { EvaluationStatusChip } from "./EvaluationStatusChip"

import type { Meta, StoryObj } from "@storybook/react-vite"

import type { EvaluationProgress } from "../model/applicantListTypes"

const progresses: EvaluationProgress[] = ["before", "inProgress", "done"]

const meta = {
  title: "Feature/Evaluation/EvaluationStatusChip",
  component: EvaluationStatusChip,
  tags: ["autodocs"],
  args: {
    progress: "inProgress",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof EvaluationStatusChip>

export default meta
type Story = StoryObj<typeof meta>

export const InProgress: Story = {}

export const AllStates: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {progresses.map((progress) => (
        <EvaluationStatusChip key={progress} progress={progress} />
      ))}
    </div>
  ),
}
