import { cva, type VariantProps } from "class-variance-authority"

import SvgPersonButtonIcon from "@/shared/assets/icon/people/PersonButtonIcon"
import { cn } from "@/shared/lib/utils"

/**
 * 사용되는 곳: 프로젝트 상세 카드 내 팀원 정보 확인 버튼
 * 피그마 기준: Button 내 사람 아이콘 포함 버튼
 */
import type { ButtonHTMLAttributes } from "react"

const teamMemberButtonVariants = cva(
  "inline-flex h-11 min-w-[3.25rem] items-center justify-center rounded-xl px-4 py-2.5 transition-colors disabled:pointer-events-none",
  {
    variants: {
      variant: {
        fill: "bg-teal-gray-600 hover:bg-teal-gray-700 disabled:bg-teal-gray-300",
        weak: "bg-teal-gray-150 hover:bg-teal-gray-200 disabled:bg-teal-gray-100",
      },
    },
    defaultVariants: {
      variant: "fill",
    },
  },
)

const iconVariants = cva("h-6 w-6", {
  variants: {
    variant: {
      fill: "text-teal-gray-50",
      weak: "text-teal-gray-600",
    },
  },
  defaultVariants: {
    variant: "fill",
  },
})

interface TeamMemberButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof teamMemberButtonVariants> {}

export function TeamMemberButton({
  variant,
  className,
  ...props
}: TeamMemberButtonProps) {
  return (
    <button
      type="button"
      className={cn(teamMemberButtonVariants({ variant }), className)}
      {...props}
    >
      <SvgPersonButtonIcon className={iconVariants({ variant })} />
    </button>
  )
}
