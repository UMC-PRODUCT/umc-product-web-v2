import { fn } from "storybook/test"

import { RoundForm } from "./RoundForm"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Feature/Matching/RoundForm",
  component: RoundForm,
  tags: ["autodocs"],
  args: {
    endDate: "2026-04-30",
    endTime: "23:59",
    onEndDateChange: fn(),
    onEndTimeChange: fn(),
    onStartDateChange: fn(),
    onStartTimeChange: fn(),
    startDate: "2026-04-01",
    startTime: "00:00",
    title: "1차 매칭 기간",
  },
  parameters: {
    layout: "centered",
    routePath: "/matching/rounds",
  },
} satisfies Meta<typeof RoundForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ValidationError: Story = {
  args: {
    endDateError: true,
    startDateError: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
