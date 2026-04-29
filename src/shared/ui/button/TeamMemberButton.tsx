import { cva, type VariantProps } from "class-variance-authority"

import SvgPersonButtonIcon from "@/shared/assets/icon/people/PersonButtonIcon"
import { Button } from "@/shared/ui/Button"

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
    <Button
      variant={variant ?? "fill"}
      color="neutral"
      size="m"
      className={`min-w-[3.25rem] rounded-xl ${className ?? ""}`}
      {...props}
    >
      <SvgPersonButtonIcon className={iconVariants({ variant })} />
    </Button>
  )
}
