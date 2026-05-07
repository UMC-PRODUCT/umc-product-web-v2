import { cn } from "@/shared/lib/utils"
import { NumberTag } from "@/shared/ui/NumberTag"

import type { NumberTagVariant } from "@/shared/ui/NumberTag"

type BlockType = "round1" | "filled" | "none" | "blocked"

interface MatchingBlockProps {
  type?: BlockType
  name?: string
  tagVariant?: NumberTagVariant
  onNameClick?: () => void
  onAssignClick?: () => void
  className?: string
}

export function MatchingBlock({
  type = "filled",
  name,
  tagVariant = "round2",
  onNameClick,
  onAssignClick,
  className,
}: MatchingBlockProps) {
  if (type === "blocked") {
    return (
      <div
        className={cn(
          "border-teal-gray-150 bg-teal-gray-100 relative flex h-8.5 w-31 items-center overflow-clip border",
          className,
        )}
      >
        <svg className="absolute inset-0 size-full" preserveAspectRatio="none">
          <line
            x1="0"
            y1="100%"
            x2="100%"
            y2="0"
            stroke="#D3D8D8"
            strokeWidth="1"
          />
        </svg>
      </div>
    )
  }

  if (type === "none") {
    return (
      <button
        type="button"
        onClick={onAssignClick}
        className={cn(
          "group border-teal-gray-100 flex h-8.5 w-31 cursor-pointer items-center border bg-white",
          className,
        )}
      >
        <span className="text-body-3-medium text-teal-gray-400 hidden w-full text-center group-hover:block">
          임의 배정하기
        </span>
      </button>
    )
  }

  if (type === "round1") {
    return (
      <div
        className={cn(
          "flex h-8.5 w-31 items-center gap-1.5 border border-teal-100 bg-teal-50/70 p-2",
          className,
        )}
      >
        <NumberTag variant="round1" />
        <button
          type="button"
          onClick={onNameClick}
          className="text-body-3-medium text-teal-gray-800 cursor-pointer whitespace-nowrap hover:underline"
        >
          {name}
        </button>
      </div>
    )
  }

  // filled (default)
  return (
    <div
      className={cn(
        "border-teal-gray-100 hover:bg-teal-gray-50/50 flex h-8.5 w-31 items-center gap-1.5 border bg-white p-2",
        className,
      )}
    >
      <NumberTag variant={tagVariant} />
      <button
        type="button"
        onClick={onNameClick}
        className="text-body-3-medium text-teal-gray-800 cursor-pointer whitespace-nowrap hover:underline"
      >
        {name}
      </button>
    </div>
  )
}
