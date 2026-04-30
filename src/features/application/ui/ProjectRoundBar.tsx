import { cn } from "@/shared/lib/utils"

const BAR_STYLES = [
  "from-teal-500 via-teal-500/80 to-teal-500/50",
  "from-teal-400 via-teal-400/80 to-teal-400/50",
  "from-teal-200 via-teal-200/80 to-teal-200/70",
] as const

interface ProjectRoundBarProps {
  projectName: string
  rounds: number[]
  maxValue: number
  maxHeightPx?: number
  className?: string
}

export function ProjectRoundBar({
  projectName,
  rounds,
  maxValue,
  maxHeightPx = 100,
  className,
}: ProjectRoundBarProps) {
  return (
    <div className={cn("flex min-w-15 flex-col items-center", className)}>
      <div
        className="flex w-15 items-end justify-center gap-1.25"
        style={{ height: `${maxHeightPx}px` }}
      >
        {rounds.slice(0, 3).map((value, i) => {
          const heightPx =
            maxValue > 0
              ? Math.max(4, Math.round((value / maxValue) * maxHeightPx))
              : 4

          return (
            <div
              key={i}
              className={cn(
                "w-2.5 rounded-t bg-linear-to-b",
                BAR_STYLES[i] ?? BAR_STYLES[2],
              )}
              style={{ height: `${heightPx}px` }}
            />
          )
        })}
      </div>
      <span className="text-body-2-medium text-teal-gray-900 mt-1.25 text-center whitespace-nowrap">
        {projectName}
      </span>
    </div>
  )
}
