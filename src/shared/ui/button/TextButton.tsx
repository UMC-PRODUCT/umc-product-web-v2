import { cn } from "@/shared/lib/utils"

type TextButtonProps = React.ComponentPropsWithoutRef<"button">

export function TextButton({
  className,
  disabled,
  children,
  type = "button",
  ...props
}: TextButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "text-left transition-colors",
        !disabled && "hover:underline",
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
