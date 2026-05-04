import { useState } from "react"

import ToggleEyeClosedIcon from "@/shared/assets/icon/toggle/ToggleEyeClosedIcon"
import ToggleEyeOpenedIcon from "@/shared/assets/icon/toggle/ToggleEyeOpenedIcon"

interface InputProps extends Omit<React.ComponentProps<"input">, "type"> {
  variant: "id" | "password"
}

export function Input({
  placeholder,
  variant = "id",
  value,
  onChange,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [internalValue, setInternalValue] = useState("")

  const isPassword = variant === "password"
  const isControlled = value !== undefined
  const displayedValue = isControlled ? String(value ?? "") : internalValue
  const hasValue = Boolean(displayedValue.length)
  const paddingRightClass = isPassword && hasValue ? "pr-10" : "pr-2.5"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e)
  }
  const inputType = isPassword ? (showPassword ? "text" : "password") : "text"

  return (
    <div className="relative">
      <input
        type={inputType}
        className={
          "border-teal-gray-300 shadow-inner-neutral-1 text-label-1-medium text-teal-gray-700 placeholder:text-teal-gray-400 w-90 rounded-[12px] border bg-white py-3 pl-4 outline-none focus:border-teal-400 focus:bg-teal-50 focus:text-teal-600 " +
          paddingRightClass
        }
        placeholder={placeholder}
        value={displayedValue}
        onChange={handleChange}
        {...props}
      />

      {isPassword && hasValue ? (
        <button
          type="button"
          aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          onClick={() => setShowPassword((s) => !s)}
          className="text-teal-gray-400 absolute top-1/2 right-2.5 -translate-y-1/2"
        >
          {showPassword ? (
            <ToggleEyeOpenedIcon className="h-5 w-5" />
          ) : (
            <ToggleEyeClosedIcon className="h-5 w-5" />
          )}
        </button>
      ) : null}
    </div>
  )
}
