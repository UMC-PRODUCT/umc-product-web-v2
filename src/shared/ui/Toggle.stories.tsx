import { type ComponentProps, useState } from "react"
import { expect, fn } from "storybook/test"

import { Toggle } from "./Toggle"

import type { Meta, StoryObj } from "@storybook/react-vite"

function ControlledToggle(props: ComponentProps<typeof Toggle>) {
  const [checked, setChecked] = useState(props.checked)

  return (
    <Toggle
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
  title: "Shared UI/Form/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  args: {
    "aria-label": "알림 설정",
    checked: false,
    onChange: fn(),
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <ControlledToggle {...args} />,
}

export const SizesAndStates: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Toggle
        aria-label="Small off"
        checked={false}
        onChange={fn()}
        size="sm"
      />
      <Toggle aria-label="Small on" checked onChange={fn()} size="sm" />
      <Toggle aria-label="Medium off" checked={false} onChange={fn()} />
      <Toggle aria-label="Disabled" checked={false} disabled onChange={fn()} />
    </div>
  ),
}

export const Interactive: Story = {
  render: (args) => <ControlledToggle {...args} />,
  play: async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole("switch")
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute("aria-checked", "true")
    await expect(args.onChange).toHaveBeenCalledWith(true)
  },
}
