import { useState } from "react"

import EyeClosed from "@/shared/assets/icon/eye/EyeClosed"
import EyeOpen from "@/shared/assets/icon/eye/EyeOpen"
import { cn } from "@/shared/lib/utils"

interface InputProps extends Omit<React.ComponentProps<"input">, "type"> {
  variant?: "id" | "password"
}

export function Input({
  placeholder,
  variant = "id",
  value,
  onChange,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = variant === "password"
  const hasValue = !!value
  const paddingRightClass = isPassword && hasValue ? "pr-10" : "pr-2.5"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
  }
  const inputType = isPassword ? (showPassword ? "text" : "password") : "text"

  return (
    <div className="relative">
      <input
        type={inputType}
        className={cn(
          "border-teal-gray-300 shadow-inner-neutral-1 text-label-1-medium text-teal-gray-700 placeholder:text-teal-gray-400 h-11 w-90 rounded-[12px] border bg-white py-3 pl-4 outline-none focus:border-teal-400 focus:bg-teal-50 focus:text-teal-600",
          paddingRightClass,
        )}
        placeholder={placeholder}
        value={value}
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
            <EyeOpen className="h-5 w-5" />
          ) : (
            <EyeClosed className="h-5 w-5" />
          )}
        </button>
      ) : null}
    </div>
  )
}
