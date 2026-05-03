import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const barVariants = cva("w-full rounded-t-[0.375rem] px-2 pt-2", {
  variants: {
    rank: {
      1: "bg-teal-500",
      2: "bg-teal-400",
      3: "bg-teal-300",
      4: "bg-teal-200",
      5: "border-b-[0.3125rem] border-teal-200 bg-teal-50",
    },
  },
})

const labelVariants = cva(
  "text-[0.75rem] font-bold leading-[1.4] tracking-[-0.02em]",
  {
    variants: {
      rank: {
        1: "text-white",
        2: "text-teal-600",
        3: "text-teal-500",
        4: "text-teal-500",
        5: "text-teal-500",
      },
    },
  },
)

type Rank = 1 | 2 | 3 | 4 | 5

interface RankBarProps {
  rank: Rank
  count: number
  label: string
  heightPx: number
  className?: string
}

export function RankBar({
  rank,
  count,
  label,
  heightPx,
  className,
}: RankBarProps) {
  const isMinimal = rank === 5

  return (
    <div className={cn("flex w-[4.5rem] flex-col gap-2.5", className)}>
      {/* 카운트 헤더 */}
      <div className="flex items-end gap-px px-1">
        <span className="text-[1.375rem] leading-none font-bold tracking-[-0.02em] text-teal-600">
          {count}
        </span>
        <span className="w-[0.6875rem] pb-0.5 text-[0.75rem] leading-none font-bold tracking-[-0.02em] text-teal-600">
          명
        </span>
      </div>

      {/* 막대 */}
      {isMinimal ? (
        <div className="flex w-full flex-col gap-2.5">
          <div className="px-2 pt-2">
            <span className={labelVariants({ rank })}>{label}</span>
          </div>
          <div className="h-[0.3125rem] w-full rounded-t border-b-[0.3125rem] border-teal-200 bg-teal-50" />
        </div>
      ) : (
        <div
          className={barVariants({ rank })}
          style={{ height: `${heightPx}px` }}
        >
          <span className={labelVariants({ rank })}>{label}</span>
        </div>
      )}
    </div>
  )
}
