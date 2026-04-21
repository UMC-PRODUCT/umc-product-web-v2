import { cva, type VariantProps } from "class-variance-authority"
import { type ComponentPropsWithoutRef } from "react"

import { cn } from "@/shared/lib/utils"

const noticeSubmitButtonVariants = cva(
  "inline-flex h-11 w-[90px] shrink-0 items-center justify-center rounded-[12px] text-label-1-medium transition-colors disabled:pointer-events-none",
  {
    variants: {
      variant: {
        publish: "",
        edit: "",
      },
      state: {
        initial: "",
        default: "",
        loading: "",
        done: "",
      },
    },
    compoundVariants: [
      {
        variant: "publish",
        state: "initial",
        className: "bg-teal-300 text-teal-gray-50",
      },
      {
        variant: "publish",
        state: "default",
        className: "bg-teal-600 text-white hover:bg-teal-700",
      },
      {
        variant: "publish",
        state: "loading",
        className: "bg-teal-700 text-white",
      },
      {
        variant: "publish",
        state: "done",
        className: "bg-teal-300 text-teal-gray-50",
      },
      {
        variant: "edit",
        state: "initial",
        className: "bg-teal-100 text-teal-300",
      },
      {
        variant: "edit",
        state: "default",
        className: "bg-teal-100 text-teal-600 hover:bg-teal-200",
      },
      {
        variant: "edit",
        state: "loading",
        className: "bg-teal-200 text-teal-600",
      },
      {
        variant: "edit",
        state: "done",
        className: "bg-teal-100 text-teal-300",
      },
    ],
    defaultVariants: {
      variant: "publish",
      state: "default",
    },
  },
)

interface NoticeSubmitButtonProps
  extends
    Omit<ComponentPropsWithoutRef<"button">, "color">,
    VariantProps<typeof noticeSubmitButtonVariants> {
  isLoading?: boolean
  isDone?: boolean
}

export function NoticeSubmitButton({
  className,
  variant,
  isLoading = false,
  isDone = false,
  disabled,
  children,
  ...props
}: NoticeSubmitButtonProps) {
  const isCompleted = isDone && !isLoading
  const isInitial = disabled && !isLoading && !isCompleted
  const state = isLoading
    ? "loading"
    : isCompleted
      ? "done"
      : isInitial
        ? "initial"
        : "default"

  return (
    <button
      type="button"
      aria-busy={isLoading || undefined}
      disabled={disabled || isLoading || isCompleted}
      className={cn(noticeSubmitButtonVariants({ variant, state }), className)}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="sr-only">로딩 중</span>
          <span className="flex items-center gap-1.25" aria-hidden="true">
            <span className="animation-duration-[1000ms] h-2 w-2 animate-pulse rounded-full bg-current opacity-100" />
            <span className="animation-duration-[1000ms] h-2 w-2 animate-pulse rounded-full bg-current opacity-60 [animation-delay:75ms]" />
            <span className="animation-duration-[1000ms] h-2 w-2 animate-pulse rounded-full bg-current opacity-20 [animation-delay:150ms]" />
          </span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
