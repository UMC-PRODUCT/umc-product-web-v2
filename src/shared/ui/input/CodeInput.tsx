import { cva } from "class-variance-authority"
import {
  type ChangeEvent,
  type ClipboardEvent,
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react"

import { cn } from "@/shared/lib/utils"

const cellVariants = cva(
  "aspect-square w-13 max-[419px]:w-12 rounded-2xl max-[419px]:rounded-xl border px-2.5 text-center text-heading-4-semibold max-[419px]:text-heading-5-semibold caret-teal-600 outline-none transition-colors",
  {
    variants: {
      state: {
        default: "border-teal-gray-300 bg-white text-teal-600",
        focus: "border-teal-400 bg-teal-50 text-teal-600",
        filled: "border-teal-300 bg-white text-teal-600",
        error: "border-error-400 bg-error-50/60 text-error-500",
        disabled:
          "cursor-not-allowed border-teal-gray-300 bg-teal-gray-50 text-teal-gray-300",
      },
    },
    defaultVariants: { state: "default" },
  },
)

const CELL_SHADOW =
  "1px 1px 2px 0 rgba(211, 216, 216, 0.15) inset, -1px -1px 1px 0 rgba(255, 255, 255, 0.25) inset"

const SANITIZE = /[^A-Z0-9]/g

export interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  length?: number
  state?: "default" | "error" | "disabled"
  autoFocus?: boolean
  shakeSignal?: number
  className?: string
}

export const CodeInput = forwardRef<HTMLDivElement, CodeInputProps>(
  function CodeInput(
    {
      value,
      onChange,
      onComplete,
      length = 6,
      state = "default",
      autoFocus = false,
      shakeSignal,
      className,
    },
    ref,
  ) {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([])
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const [shaking, setShaking] = useState(false)

    useEffect(() => {
      if (!shakeSignal) return
      setShaking(true)
    }, [shakeSignal])

    const disabled = state === "disabled"

    const focusCell = (index: number) => {
      const clamped = Math.max(0, Math.min(index, length - 1))
      inputsRef.current[clamped]?.focus()
    }

    const commit = (next: string) => {
      const sliced = next.slice(0, length)
      onChange(sliced)
      if (sliced.length === length) onComplete?.(sliced)
    }

    const setCharAt = (index: number, char: string) => {
      const cells = Array.from({ length }, (_, i) => value[i] ?? "")
      cells[index] = char
      return cells.join("")
    }

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
      const sanitized = e.target.value.toUpperCase().replace(SANITIZE, "")
      if (sanitized === "") {
        commit(setCharAt(index, ""))
        return
      }
      const char = sanitized.slice(-1)
      commit(setCharAt(index, char))
      if (index < length - 1) focusCell(index + 1)
    }

    const handleKeyDown = (
      index: number,
      e: KeyboardEvent<HTMLInputElement>,
    ) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        if (value[index]) {
          onChange(setCharAt(index, ""))
        } else if (index > 0) {
          onChange(setCharAt(index - 1, ""))
          focusCell(index - 1)
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        focusCell(index - 1)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        focusCell(index + 1)
      }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData
        .getData("text")
        .toUpperCase()
        .replace(SANITIZE, "")
        .slice(0, length)
      if (!pasted) return
      commit(pasted)
      focusCell(pasted.length)
    }

    const handleClick = (index: number) => {
      const firstEmpty = Math.min(value.length, length - 1)
      if (index > firstEmpty) focusCell(firstEmpty)
    }

    const handleFocus = (index: number) => {
      setFocusedIndex(index)
    }

    const getCellState = (index: number) => {
      if (disabled) return "disabled"
      if (state === "error") return "error"
      if (focusedIndex === index) return "focus"
      if (value[index]) return "filled"
      return "default"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-2.5 max-[419px]:gap-2",
          shaking && "animate-shake",
          className,
        )}
        onAnimationEnd={() => setShaking(false)}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            type="text"
            inputMode="text"
            autoComplete="off"
            maxLength={1}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            value={value[index] ?? ""}
            aria-label={`인증코드 ${index + 1}번째 자리`}
            style={{ boxShadow: CELL_SHADOW }}
            className={cn(cellVariants({ state: getCellState(index) }))}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            onClick={() => handleClick(index)}
            onBlur={() => setFocusedIndex(-1)}
          />
        ))}
      </div>
    )
  },
)
