import { type ComponentProps, useState } from "react"
import { expect, fn } from "storybook/test"

import { Checkbox } from "./Checkbox"

import type { Meta, StoryObj } from "@storybook/react-vite"

function ControlledCheckbox(props: ComponentProps<typeof Checkbox>) {
  const [checked, setChecked] = useState(props.checked)

  return (
    <Checkbox
      {...props}
      checked={checked}
      onChange={(nextChecked) => {
        setChecked(nextChecked)
        props.onChange(nextChecked)
      }}
    />
  )
}

const meta = {
  title: "Shared UI/Form/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    "aria-label": "체크박스",
    checked: false,
    onChange: fn(),
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <ControlledCheckbox {...args} variant="primary" />,
}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Checkbox
        aria-label="Primary checked"
        checked
        onChange={fn()}
        variant="primary"
      />
      <Checkbox
        aria-label="Issue checked"
        checked
        onChange={fn()}
        variant="issue"
      />
      <Checkbox
        aria-label="Primary large"
        checked={false}
        onChange={fn()}
        size="lg"
        variant="primary"
      />
      <Checkbox
        aria-label="Disabled"
        checked={false}
        disabled
        onChange={fn()}
        variant="primary"
      />
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    variant: "primary",
  },
  render: (args) => <ControlledCheckbox {...args} />,
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox")
    await userEvent.click(checkbox)
    await expect(checkbox).toHaveAttribute("aria-checked", "true")
    await expect(args.onChange).toHaveBeenCalledWith(true)
  },
}
