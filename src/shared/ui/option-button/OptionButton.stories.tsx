import { expect, fn } from "storybook/test"

import { OptionButton } from "./OptionButton"
import { OptionButtonGroup } from "./OptionButtonGroup"

import type { Meta, StoryObj } from "@storybook/react-vite"

const options = [
  { label: "기획", value: "plan" },
  { label: "디자인", value: "design" },
  { label: "개발", value: "development" },
]

const meta = {
  title: "Shared UI/Form/OptionButton",
  component: OptionButton,
  tags: ["autodocs"],
} satisfies Meta<typeof OptionButton>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  render: () => (
    <OptionButtonGroup defaultValue="design" onValueChange={fn()}>
      {options.map((option) => (
        <OptionButton key={option.value} value={option.value}>
          {option.label}
        </OptionButton>
      ))}
    </OptionButtonGroup>
  ),
}

export const Multiple: Story = {
  render: () => (
    <OptionButtonGroup
      defaultValue={["design"]}
      onValueChange={fn()}
      type="multiple"
      variant="segmented"
    >
      {options.map((option) => (
        <OptionButton key={option.value} value={option.value} size="xs">
          {option.label}
        </OptionButton>
      ))}
    </OptionButtonGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      {(["xl", "sm", "xs"] as const).map((size) => (
        <OptionButtonGroup key={size} defaultValue="design" variant="segmented">
          {options.map((option) => (
            <OptionButton key={option.value} size={size} value={option.value}>
              {option.label}
            </OptionButton>
          ))}
        </OptionButtonGroup>
      ))}
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <OptionButtonGroup defaultValue="design" variant="segmented">
      <OptionButton value="plan">기획</OptionButton>
      <OptionButton disabled value="design">
        디자인
      </OptionButton>
      <OptionButton value="development">개발</OptionButton>
    </OptionButtonGroup>
  ),
}

export const Interactive: Story = {
  render: () => (
    <OptionButtonGroup defaultValue="plan" variant="segmented">
      <OptionButton value="plan">기획</OptionButton>
      <OptionButton value="development">개발</OptionButton>
    </OptionButtonGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    const development = canvas.getByRole("radio", { name: "개발" })
    await userEvent.click(development)
    await expect(development).toHaveAttribute("aria-checked", "true")
  },
}
