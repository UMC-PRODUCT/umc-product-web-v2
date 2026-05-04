import { cn } from "@/shared/lib/utils"

export type NumberTagVariant =
  | "default"
  | "round1"
  | "round2"
  | "round3"
  | "random"

interface NumberTagProps {
  variant?: NumberTagVariant
  className?: string
}

const VARIANT_STYLES: Record<
  NumberTagVariant,
  { bg: string; text: string; label: string }
> = {
  default: { bg: "bg-teal-gray-100", text: "text-teal-gray-600", label: "1" },
  round1: { bg: "bg-teal-700", text: "text-white", label: "1" },
  round2: { bg: "bg-teal-500", text: "text-white", label: "2" },
  round3: { bg: "bg-teal-300", text: "text-teal-500", label: "3" },
  random: { bg: "bg-teal-gray-300", text: "text-teal-gray-600", label: "R" },
}

export function NumberTag({ variant = "default", className }: NumberTagProps) {
  const { bg, text, label } = VARIANT_STYLES[variant]

  return (
    <div
      className={cn(
        "shadow-inner-neutral-3 relative flex size-3.5 items-center justify-center rounded",
        bg,
        className,
      )}
    >
      <span className={cn("text-[10px] leading-[1.5] font-medium", text)}>
        {label}
      </span>
    </div>
  )
}
