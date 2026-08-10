import { cn } from "@/shared/lib/utils"

type CounterLabelSize = "xs" | "sm" | "md" | "lg"
type CounterLabelEmphasis = "none" | "current"

interface CounterLabelProps {
  current: number
  total: number
  size?: CounterLabelSize
  emphasis?: CounterLabelEmphasis
  className?: string
}

// 피그마 'Counter' 컴포넌트 스펙. 숫자 칸과 슬래시 칸의 폭/정렬이 다르다.
const sizeStyles: Record<CounterLabelSize, { number: string; slash: string }> =
  {
    xs: {
      number: "min-w-2 text-center text-caption-2-regular",
      slash: "w-1.25 text-right text-caption-2-regular",
    },
    sm: {
      number: "min-w-2.25 text-center text-body-2-medium",
      slash: "w-1.25 text-right text-body-2-regular",
    },
    md: {
      number: "min-w-2.5 text-right text-body-1-medium",
      slash: "w-1.25 text-right text-body-1-regular",
    },
    lg: {
      number: "min-w-2.5 text-right text-subtitle-1-medium",
      slash: "w-1.25 text-right text-subtitle-1-medium font-normal!",
    },
  }

export function CounterLabel({
  current,
  total,
  size = "md",
  emphasis = "none",
  className,
}: CounterLabelProps) {
  const styles = sizeStyles[size]

  return (
    <span
      className={cn(
        "text-teal-gray-500 inline-flex items-center gap-0.5",
        className,
      )}
    >
      <span
        className={cn(styles.number, emphasis === "current" && "text-teal-500")}
      >
        {current}
      </span>
      <span
        className={cn(
          styles.slash,
          emphasis === "current" && "text-teal-gray-600",
        )}
      >
        /
      </span>
      <span
        className={cn(
          styles.number,
          emphasis === "current" && "text-teal-gray-600",
        )}
      >
        {total}
      </span>
    </span>
  )
}
