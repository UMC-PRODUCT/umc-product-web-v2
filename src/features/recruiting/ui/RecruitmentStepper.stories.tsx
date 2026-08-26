import { type ComponentProps, useState } from "react"
import { expect, fn } from "storybook/test"

import { RecruitmentStepper } from "./RecruitmentStepper"

import type { Meta, StoryObj } from "@storybook/react-vite"

function ControlledStepper(props: ComponentProps<typeof RecruitmentStepper>) {
  const [step, setStep] = useState(props.step)

  return (
    <RecruitmentStepper
      {...props}
      step={step}
      onStepChange={(nextStep) => {
        setStep(nextStep)
        props.onStepChange(nextStep)
      }}
    />
  )
}

const meta = {
  title: "Feature/Recruiting/RecruitmentStepper",
  component: RecruitmentStepper,
  tags: ["autodocs"],
  args: {
    onStepChange: fn(),
    step: 1,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof RecruitmentStepper>

export default meta
type Story = StoryObj<typeof meta>

export const BasicInfo: Story = {}

export const Questions: Story = {
  args: {
    step: 2,
  },
}

export const Announcement: Story = {
  args: {
    step: 3,
  },
}

export const Interactive: Story = {
  render: (args) => <ControlledStepper {...args} />,
  play: async ({ canvas, userEvent }) => {
    const announcement = canvas.getByRole("button", { name: "모집 공고" })
    await userEvent.click(announcement)
    await expect(announcement).toHaveAttribute("aria-current", "step")
  },
}
