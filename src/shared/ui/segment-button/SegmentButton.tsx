import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex h-9.5 shrink-0 cursor-pointer items-center overflow-clip rounded-xl transition-all",
  {
    variants: {
      selected: {
        true: "bg-white shadow-drop-primary-1",
        false:
          "bg-transparent hover:bg-teal-gray-150 hover:shadow-inner-neutral-1",
      },
      type: {
        number: "min-w-20 gap-2 py-1 pl-3 pr-5",
        text: "min-w-20 justify-center px-3 py-1",
      },
    },
    defaultVariants: {
      selected: false,
      type: "text",
    },
  },
)

const badgeVariants = cva(
  "flex size-5 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold leading-[1.45] text-teal-gray-600 shadow-pagination-num-hover",
  {
    variants: {
      selected: {
        true: "bg-teal-gray-150",
        false: "bg-teal-gray-200",
      },
    },
    defaultVariants: { selected: false },
  },
)

const textVariants = cva("whitespace-nowrap", {
  variants: {
    selected: {
      true: "text-label-1-semibold tracking-[-0.32px] text-teal-gray-800",
      false: "text-subtitle-3-semibold text-teal-600",
    },
  },
  defaultVariants: { selected: false },
})

export interface SegmentButtonItem {
  value: string
  label: string
  disabled?: boolean
}

interface SegmentButtonProps {
  items: SegmentButtonItem[]
  value: string
  onValueChange: (value: string) => void
  type?: "number" | "text"
  className?: string
  itemClassName?: string
}

export function SegmentButton({
  items,
  value,
  onValueChange,
  type = "text",
  className,
  itemClassName,
}: SegmentButtonProps) {
  return (
    <div
      className={cn(
        "bg-teal-gray-100 shadow-inner-neutral-2 inline-flex items-center gap-2 rounded-[14px] p-1",
        className,
      )}
    >
      {items.map((item, index) => {
        const isSelected = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isSelected}
            disabled={item.disabled}
            onClick={() => onValueChange(item.value)}
            className={cn(
              buttonVariants({ selected: isSelected, type }),
              item.disabled && "cursor-not-allowed opacity-40",
              itemClassName,
            )}
          >
            {type === "number" && (
              <span className={badgeVariants({ selected: isSelected })}>
                {index + 1}
              </span>
            )}
            <span className={textVariants({ selected: isSelected })}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
