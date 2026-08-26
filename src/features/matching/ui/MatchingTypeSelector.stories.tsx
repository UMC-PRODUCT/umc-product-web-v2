import { type ComponentProps, useState } from "react"
import { expect, fn } from "storybook/test"

import { MatchingTypeSelector } from "./MatchingTypeSelector"

import type { Meta, StoryObj } from "@storybook/react-vite"

import type { MatchingType } from "../model/matchingRoundMock"

function ControlledMatchingTypeSelector(
  props: ComponentProps<typeof MatchingTypeSelector>,
) {
  const [selected, setSelected] = useState(props.selected)

  return (
    <MatchingTypeSelector
      {...props}
      selected={selected}
      onChange={(nextSelected) => {
        setSelected(nextSelected)
        props.onChange(nextSelected)
      }}
    />
  )
}

const meta = {
  title: "Feature/Matching/MatchingTypeSelector",
  component: MatchingTypeSelector,
  tags: ["autodocs"],
  args: {
    onChange: fn(),
    selected: "Plan-Design 매칭" as MatchingType,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof MatchingTypeSelector>

export default meta
type Story = StoryObj<typeof meta>

export const PlanDesign: Story = {}

export const PlanDevelop: Story = {
  args: {
    selected: "Plan-Develop 매칭",
  },
}

export const Interactive: Story = {
  render: (args) => <ControlledMatchingTypeSelector {...args} />,
  play: async ({ canvas, userEvent }) => {
    const planDevelop = canvas.getByRole("button", {
      name: "Plan-Develop 매칭",
    })
    await userEvent.click(planDevelop)
    await expect(planDevelop).toHaveAttribute("aria-pressed", "true")
  },
}
