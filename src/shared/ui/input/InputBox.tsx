import { cva } from "class-variance-authority"
import {
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useRef,
  useState,
} from "react"

import CircleBang from "@/shared/assets/icon/bang/CircleBang"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import CloseCircleIcon from "@/shared/assets/icon/close/CloseCircleIcon"
import EyeClosed from "@/shared/assets/icon/eye/EyeClosed"
import EyeOpen from "@/shared/assets/icon/eye/EyeOpen"
import { cn } from "@/shared/lib/utils"

export type InputBoxState = "default" | "success" | "error" | "disabled"
export type InputBoxType = "default" | "clear" | "password" | "verification"
export type InputBoxSize = "md" | "sm"

function formatRemainingSeconds(seconds: number): string {
  const s = Math.max(0, seconds)
  const mm = String(Math.floor(s / 60)).padStart(2, "0")
  const ss = String(s % 60).padStart(2, "0")
  return `${mm}:${ss}`
}

const inputBoxVariants = cva(
  "inline-flex h-11 w-[300px] items-center gap-1 rounded-[12px] border pl-4 cursor-text shadow-inner-neutral-2 transition-colors",
  {
    variants: {
      state: {
        default:
          "bg-white border-teal-gray-300 hover:bg-teal-gray-50 focus-within:bg-teal-50 focus-within:border-teal-400",
        success: "bg-teal-50 border-teal-400",
        error: "bg-error-50/60 border-error-400",
        disabled:
          "bg-teal-gray-50 border-teal-gray-300 cursor-not-allowed pointer-events-none",
      },
    },
    defaultVariants: { state: "default" },
  },
)

interface InputBoxProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "size" | "disabled"
> {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  type?: InputBoxType
  state?: InputBoxState
  size?: InputBoxSize
  onClear?: () => void
  className?: string
  inputClassName?: string
  rightAdornment?: ReactNode
  remainingSeconds?: number
}

export const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  function InputBox(
    {
      value,
      onChange,
      type = "default",
      state = "default",
      size = "md",
      onClear,
      className,
      inputClassName,
      rightAdornment,
      remainingSeconds,
      ...props
    },
    ref,
  ) {
    const [pwVisible, setPwVisible] = useState(false)
    const internalRef = useRef<HTMLInputElement>(null)

    const isDisabled = state === "disabled"
    const isFilled = value.length > 0

    const hasAdornment =
      rightAdornment !== undefined ||
      state === "success" ||
      state === "error" ||
      (type === "clear" && isFilled) ||
      type === "password" ||
      type === "verification"

    const prClass = (() => {
      if (!hasAdornment) return isFilled ? "pr-4" : "pr-3"
      if (type === "verification") return "pr-3"
      if (state === "success" || state === "error") return "pr-2.5"
      return "pr-3"
    })()

    const inputType =
      type === "password" ? (pwVisible ? "text" : "password") : "text"
    const isPasswordHidden = type === "password" && !pwVisible

    const handleClear = () => {
      onClear?.()
      internalRef.current?.focus()
    }

    const renderAdornment = () => {
      if (rightAdornment !== undefined) return rightAdornment

      if (type === "verification") {
        const timerColorClass: Record<InputBoxState, string> = {
          default: "text-teal-500",
          success: "text-teal-500",
          error: "text-error-500",
          disabled: "text-teal-gray-300",
        }
        const timerFontClass: Record<InputBoxSize, string> = {
          md: "text-label-1-medium",
          sm: "text-body-2-medium",
        }
        return (
          <span
            className={cn(
              "shrink-0 tabular-nums",
              timerColorClass[state],
              timerFontClass[size],
            )}
          >
            {formatRemainingSeconds(remainingSeconds ?? 0)}
          </span>
        )
      }

      if (state === "success") {
        const icon = <CheckIcon width={20} height={20} aria-hidden="true" />
        if (onClear) {
          return (
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => {
                e.preventDefault()
                handleClear()
              }}
              aria-label="선택 해제"
              className="shrink-0 cursor-pointer text-teal-600"
            >
              {icon}
            </button>
          )
        }
        return <span className="shrink-0 text-teal-600">{icon}</span>
      }

      if (state === "error") {
        return (
          <span className="text-error-500 shrink-0">
            <CircleBang width={24} height={24} aria-hidden="true" />
          </span>
        )
      }

      if (type === "clear" && isFilled) {
        return (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => {
              e.preventDefault()
              handleClear()
            }}
            aria-label="검색어 지우기"
            className="text-teal-gray-300 shrink-0 cursor-pointer"
          >
            <CloseCircleIcon width={18} height={18} aria-hidden="true" />
          </button>
        )
      }

      if (type === "password") {
        return (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => {
              e.preventDefault()
              setPwVisible((v) => !v)
            }}
            aria-label={pwVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="text-teal-gray-400 shrink-0 cursor-pointer"
          >
            {pwVisible ? (
              <EyeOpen width={20} height={20} aria-hidden="true" />
            ) : (
              <EyeClosed width={20} height={20} aria-hidden="true" />
            )}
          </button>
        )
      }

      return null
    }

    return (
      <div
        className={cn(inputBoxVariants({ state }), prClass, className)}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return
          internalRef.current?.focus()
          e.preventDefault()
        }}
      >
        <input
          ref={(el) => {
            internalRef.current = el
            if (typeof ref === "function") {
              ref(el)
            } else if (ref) {
              ;(
                ref as React.MutableRefObject<HTMLInputElement | null>
              ).current = el
            }
          }}
          type={inputType}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          className={cn(
            "min-w-0 flex-1 cursor-text bg-transparent outline-none",
            isPasswordHidden
              ? "text-[18px] leading-[110%] font-medium tracking-[-0.18px]"
              : size === "sm"
                ? "text-body-2-medium"
                : "text-label-1-medium",
            state === "default" &&
              "text-teal-gray-700 placeholder:text-teal-gray-400 focus:text-teal-600",
            state === "success" &&
              "placeholder:text-teal-gray-400 text-teal-600",
            state === "error" && "text-error-500 placeholder:text-error-500",
            state === "disabled" &&
              "text-teal-gray-300 placeholder:text-teal-gray-300 cursor-not-allowed",
            inputClassName,
          )}
          {...props}
        />
        {renderAdornment()}
      </div>
    )
  },
)
