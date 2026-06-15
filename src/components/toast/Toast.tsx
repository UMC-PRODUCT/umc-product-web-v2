import { cva, type VariantProps } from "class-variance-authority"

import SvgCircleCheckIcon from "@/shared/assets/icon/check/CircleCheckIcon"
import SvgCloseIcon from "@/shared/assets/icon/close/CloseIcon"
import RubberConeIcon from "@/shared/assets/icon/error/RubberConeIcon"
import { cn } from "@/shared/lib/utils"

export const FADE_OUT_DURATION = 300

const toastVariants = cva(
  "w-max min-w-[min(400px,90vw)] max-w-[min(90vw,600px)] min-h-12.5 px-4 py-1 gap-2.5 rounded-[12px] flex items-center text-label-1-medium transition-opacity",
  {
    variants: {
      variant: {
        deep: "",
        weak: "",
      },
      color: {
        primary: "",
        red: "",
      },
      type: {
        default: "justify-between shadow-drop-neutral-2",
        time: "justify-between shadow-drop-neutral-2",
        notice: "justify-center shadow-drop-neutral-1",
      },
    },
    compoundVariants: [
      { variant: "deep", color: "primary", className: "bg-teal-200" },
      { variant: "weak", color: "primary", className: "bg-teal-100" },
      { variant: "deep", color: "red", className: "bg-error-200" },
      { variant: "weak", color: "red", className: "bg-error-100" },
    ],
    defaultVariants: {
      variant: "deep",
      color: "primary",
      type: "default",
    },
  },
)

const iconColorMap = {
  primary: "text-teal-500",
  red: "text-error-500",
} as const

const textColorMap = {
  primary: "text-teal-700",
  red: "text-error-700",
} as const

const countdownColorMap = {
  primary: "text-teal-600",
  red: "text-teal-gray-400",
} as const

interface ToastProps extends VariantProps<typeof toastVariants> {
  message: string
  remaining: number
  isDismissing: boolean
  onDismiss: () => void
}

export function Toast({
  message,
  color = "primary",
  variant = "deep",
  type = "default",
  remaining,
  isDismissing,
  onDismiss,
}: ToastProps) {
  const resolvedColor = color ?? "primary"

  return (
    <div
      role={resolvedColor === "red" ? "alert" : "status"}
      aria-atomic="true"
      className={cn(
        toastVariants({ variant, color, type }),
        isDismissing && "opacity-0",
      )}
      style={{ transitionDuration: `${FADE_OUT_DURATION}ms` }}
    >
      {type === "notice" ? (
        <>
          <RubberConeIcon
            aria-hidden="true"
            width={24}
            height={24}
            className="shrink-0"
          />
          <span
            className={cn(
              "text-center wrap-break-word whitespace-pre-line",
              textColorMap[resolvedColor],
            )}
          >
            {message}
          </span>
          <RubberConeIcon
            aria-hidden="true"
            width={24}
            height={24}
            className="shrink-0"
          />
        </>
      ) : (
        <>
          <div className="flex min-w-0 items-center gap-2.5">
            <SvgCircleCheckIcon
              aria-hidden="true"
              width={20}
              height={20}
              className={cn("shrink-0", iconColorMap[resolvedColor])}
            />
            <span
              className={cn(
                "wrap-break-word whitespace-pre-line",
                textColorMap[resolvedColor],
              )}
            >
              {message}
            </span>
          </div>
          {type === "time" ? (
            <span
              className={cn(
                "text-label-1-medium",
                countdownColorMap[resolvedColor],
              )}
            >
              {Math.ceil(remaining / 1000)}s
            </span>
          ) : (
            <button
              type="button"
              onClick={onDismiss}
              className="text-teal-gray-400 flex items-center justify-center"
              aria-label="토스트 닫기"
            >
              <SvgCloseIcon width={20} height={20} />
            </button>
          )}
        </>
      )}
    </div>
  )
}
