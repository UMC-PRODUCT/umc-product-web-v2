import { cn } from "@/shared/lib/utils"

type CounterLabelSize = "xs" | "sm" | "md"

interface CounterLabelProps {
  current: number
  total: number
  size?: CounterLabelSize
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
      slash: "w-1.25 text-right text-body-2-medium",
    },
    md: {
      number: "min-w-2.5 text-right text-body-1-medium",
      slash: "w-1.25 text-right text-body-1-medium",
    },
  }

export function CounterLabel({
  current,
  total,
  size = "md",
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
      <span className={styles.number}>{current}</span>
      <span className={styles.slash}>/</span>
      <span className={styles.number}>{total}</span>
    </span>
  )
}
