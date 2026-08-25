import { type ComponentProps, useState } from "react"
import { expect, fn } from "storybook/test"

import { InputBox } from "./InputBox"

import type { Meta, StoryObj } from "@storybook/react-vite"

function ControlledInputBox(props: ComponentProps<typeof InputBox>) {
  const [value, setValue] = useState(props.value)

  return (
    <InputBox
      {...props}
      value={value}
      onChange={(event) => {
        setValue(event.target.value)
        props.onChange(event)
      }}
      onClear={() => {
        setValue("")
        props.onClear?.()
      }}
    />
  )
}

const meta = {
  title: "Shared UI/Form/InputBox",
  component: InputBox,
  tags: ["autodocs"],
  args: {
    onChange: fn(),
    value: "",
  },
} satisfies Meta<typeof InputBox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <ControlledInputBox {...args} placeholder="이름 입력" />,
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <InputBox value="기본 상태" onChange={fn()} state="default" />
      <InputBox value="검증 완료" onChange={fn()} state="success" />
      <InputBox value="오류가 발생했습니다" onChange={fn()} state="error" />
      <InputBox value="비활성화" onChange={fn()} state="disabled" />
    </div>
  ),
}

export const Clearable: Story = {
  args: {
    type: "clear",
    value: "검색어",
  },
  render: (args) => <ControlledInputBox {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "검색어 지우기" }))
    await expect(canvas.getByRole("textbox")).toHaveValue("")
  },
}

export const Password: Story = {
  args: {
    type: "password",
    value: "password",
  },
  render: (args) => <ControlledInputBox {...args} />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByDisplayValue("password")
    await expect(input).toHaveAttribute("type", "password")
    await userEvent.click(canvas.getByRole("button", { name: "비밀번호 보기" }))
    await expect(input).toHaveAttribute("type", "text")
  },
}

export const Verification: Story = {
  args: {
    remainingSeconds: 125,
    type: "verification",
  },
  render: (args) => (
    <ControlledInputBox {...args} placeholder="인증번호 6자리" />
  ),
}
