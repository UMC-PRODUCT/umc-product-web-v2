import { cn } from "@/shared/lib/utils"

import {
  segmentHeadingVariants,
  segmentListVariants,
  segmentTabRowVariants,
  segmentTriggerVariants,
} from "./segment.config"

export interface SegmentItem {
  id: string
  label: string
  disabled?: boolean
}

export interface SegmentProps {
  /** 예: "팀 매칭" — 없으면 제목 영역 렌더 안 함 */
  title?: string
  items: SegmentItem[]
  value: string
  onValueChange: (id: string) => void
  className?: string
}

export function Segment({
  title,
  items,
  value,
  onValueChange,
  className,
}: SegmentProps) {
  return (
    <div className={cn(segmentListVariants(), className)}>
      {title ? (
        <div className={cn(segmentHeadingVariants())}>{title}</div>
      ) : null}

      <div role="tablist" className={cn(segmentTabRowVariants())}>
        {items.map((item) => {
          const selected = item.id === value
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled || selected) return
                onValueChange(item.id)
              }}
              className={cn(segmentTriggerVariants({ selected }))}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
