import { cva, type VariantProps } from "class-variance-authority"

import PersonButtonIcon from "@/shared/assets/icon/people/PersonButtonIcon"
import { IconButton } from "@/shared/ui/button/IconButton"

import type { ButtonHTMLAttributes } from "react"

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
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof iconVariants> {}

export function TeamMemberButton({
  variant,
  className,
  ...props
}: TeamMemberButtonProps) {
  return (
    <IconButton
      variant={variant ?? "fill"}
      aria-label="팀원 보기"
      className={className}
      {...props}
    >
      <PersonButtonIcon className={iconVariants({ variant })} />
    </IconButton>
  )
}
