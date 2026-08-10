import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"

import type { ButtonHTMLAttributes } from "react"

interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  variant?: "fill" | "weak"
  "aria-label": string
}

export function IconButton({
  variant = "fill",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      color="neutral"
      size="m"
      className={cn("min-w-13", className)}
      {...props}
    >
      {children}
    </Button>
  )
}
