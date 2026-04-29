import { useLayoutEffect, useRef, useState } from "react"

import { cn } from "@/shared/lib/utils"
import { CounterLabel } from "@/shared/ui/CounterLabel"

import { QuestionFieldBox } from "./QuestionFieldBox"

interface TextQuestionFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  showCounter?: boolean
  className?: string
}

export function TextQuestionField({
  value,
  onChange,
  placeholder = "답변을 작성하세요.",
  maxLength = 200,
  showCounter = true,
  className,
}: TextQuestionFieldProps) {
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const state = focused ? "focus" : value.length > 0 ? "filled" : "default"

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <QuestionFieldBox
      state={state}
      className={cn("w-full min-w-200", className)}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "text-body-1-regular text-teal-gray-900 placeholder:text-teal-gray-400",
          "w-full resize-none overflow-hidden border-none bg-transparent outline-none",
        )}
      />
      {showCounter && focused && (
        <CounterLabel
          current={value.length}
          total={maxLength}
          size="sm"
          className="self-end"
        />
      )}
    </QuestionFieldBox>
  )
}
