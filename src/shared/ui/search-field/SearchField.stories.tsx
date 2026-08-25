import { expect, fn } from "storybook/test"

import { SearchField } from "./SearchField"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Shared UI/Form/SearchField",
  component: SearchField,
  tags: ["autodocs"],
  args: {
    onChange: fn(),
    placeholder: "검색어를 입력하세요",
  },
} satisfies Meta<typeof SearchField>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Filled: Story = {
  args: {
    defaultValue: "UMC Product",
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const Interactive: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox")
    await userEvent.type(input, "리크루팅")
    await expect(input).toHaveValue("리크루팅")
  },
}
