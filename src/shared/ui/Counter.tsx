import MinusIcon from "@/shared/assets/icon/minus/MinusIcon"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { cn } from "@/shared/lib/utils"

import type { ComponentProps } from "react"

interface CounterProps extends Omit<ComponentProps<"div">, "onChange"> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  "aria-label"?: string
}

const btnClass =
  "text-teal-gray-700 disabled:text-teal-gray-400 inline-flex h-9.5 w-9 items-center justify-center disabled:cursor-not-allowed"

export function Counter({
  value,
  onChange,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  disabled = false,
  className,
  "aria-label": ariaLabel,
  ...props
}: CounterProps) {
  if (process.env.NODE_ENV !== "production") {
    if (step <= 0) console.warn("[Counter] step은 양수여야 합니다:", step)
    if (min > max) console.warn("[Counter] min이 max보다 큽니다:", { min, max })
    if (!ariaLabel)
      console.warn(
        "[Counter] aria-label을 전달하세요. 스크린리더 접근성에 필요합니다.",
      )
  }

  const canDec = !disabled && value > min
  const canInc = !disabled && value < max

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        "border-teal-gray-200 bg-teal-gray-50 shadow-drop-neutral-2 inline-flex h-9.5 w-fit min-w-26.5 items-start rounded-[8px] border",
        "aria-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        aria-label="감소"
        disabled={!canDec}
        onClick={() => onChange(Math.max(min, value - step))}
        className={cn(btnClass, "rounded-l-[8px]")}
      >
        {/* MinusIcon viewBox(36x38) 보정: size-7(28px)로 렌더해 선 길이를 PlusIcon과 맞춤 */}
        <MinusIcon className="size-7" />
      </button>
      <span
        aria-live="polite"
        className="text-label-1-semibold flex w-8.5 min-w-6 items-center justify-center self-center pt-1 pr-0.5 text-teal-500"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="증가"
        disabled={!canInc}
        onClick={() => onChange(Math.min(max, value + step))}
        className={cn(btnClass, "rounded-r-[8px]")}
      >
        <PlusIcon className="size-5" />
      </button>
    </div>
  )
}
