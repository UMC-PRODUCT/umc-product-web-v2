import { Link } from "@tanstack/react-router"

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
  to?: string
}

export interface SegmentProps {
  title: string
  items: SegmentItem[]
  value: string
  onValueChange?: (id: string) => void
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
      <div className={cn(segmentHeadingVariants())}>{title}</div>
      <div role="tablist" className={cn(segmentTabRowVariants())}>
        {items.map((item) => {
          const selected = item.id === value
          const href = item.to

          if (href && !item.disabled) {
            return (
              <Link
                key={item.id}
                to={href}
                role="tab"
                aria-selected={selected}
                aria-current={selected ? "page" : undefined}
                className={cn(segmentTriggerVariants({ selected }))}
              >
                {item.label}
              </Link>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled || selected) return
                onValueChange?.(item.id)
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
