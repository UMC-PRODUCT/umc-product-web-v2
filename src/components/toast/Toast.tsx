import { cva, type VariantProps } from "class-variance-authority"

import SvgCircleCheckIcon from "@/shared/assets/icon/check/CircleCheckIcon"
import SvgCloseIcon from "@/shared/assets/icon/close/CloseIcon"
import { cn } from "@/shared/lib/utils"

export const FADE_OUT_DURATION = 300

const toastVariants = cva(
  "w-fit h-12.5 px-4 py-1 gap-2.5 rounded-[12px] flex justify-between items-center whitespace-nowrap text-label-1-medium shadow-drop-neutral-2 transition-opacity",
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
  type?: "default" | "time"
  remaining: number
  isDismissing: boolean
  onDismiss: () => void
  sideImage?: string
}

export function Toast({
  message,
  color = "primary",
  variant = "deep",
  type = "default",
  remaining,
  isDismissing,
  onDismiss,
  sideImage,
}: ToastProps) {
  const resolvedColor = color ?? "primary"

  return (
    <div
      role={resolvedColor === "red" ? "alert" : "status"}
      aria-atomic="true"
      className={cn(
        toastVariants({ variant, color }),
        !sideImage && "min-w-100",
        isDismissing && "opacity-0",
      )}
      style={{ transitionDuration: `${FADE_OUT_DURATION}ms` }}
    >
      {sideImage ? (
        <>
          <img
            src={sideImage}
            alt=""
            className="size-6 -scale-x-100"
            aria-hidden="true"
          />
          <span className={textColorMap[resolvedColor]}>{message}</span>
          <img src={sideImage} alt="" className="size-6" aria-hidden="true" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-2.5">
            <SvgCircleCheckIcon
              aria-hidden="true"
              width={20}
              height={20}
              className={iconColorMap[resolvedColor]}
            />
            <span className={textColorMap[resolvedColor]}>{message}</span>
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
