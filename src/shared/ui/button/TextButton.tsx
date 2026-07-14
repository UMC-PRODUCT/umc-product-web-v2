import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const textButtonVariants = cva(
  "inline-flex items-center justify-center px-1 py-0.5 text-center transition-colors hover:underline disabled:pointer-events-none disabled:no-underline disabled:opacity-50",
  {
    variants: {
      color: {
        primary: "text-teal-500 hover:decoration-teal-500",
        neutral: "text-teal-gray-500 hover:decoration-teal-gray-500",
      },
      size: {
        "16": "text-[16px] leading-6 font-normal tracking-normal",
        "14": "text-body-2-medium",
      },
    },
    compoundVariants: [
      {
        color: "neutral",
        size: "14",
        className: "text-teal-gray-700 hover:decoration-teal-gray-700",
      },
    ],
    defaultVariants: {
      color: "neutral",
      size: "16",
    },
  },
)

interface TextButtonProps
  extends
    Omit<React.ComponentPropsWithoutRef<"button">, "color">,
    VariantProps<typeof textButtonVariants> {}

export function TextButton({
  className,
  disabled,
  children,
  type = "button",
  color,
  size,
  ...props
}: TextButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(textButtonVariants({ color, size }), className)}
      {...props}
    >
      {children}
    </button>
  )
}
