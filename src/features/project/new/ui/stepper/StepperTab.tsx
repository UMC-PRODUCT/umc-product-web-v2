import { AnimatePresence, motion } from "motion/react"

import { Tooltip } from "@/components/tooltip/Tooltip"
import { cn } from "@/shared/lib/utils"

interface StepperTabProps {
  idx: number
  label: string
  isSelected: boolean
  disabled?: boolean
  disabledTooltip?: string
  onClick: () => void
}

export function StepperTab({
  idx,
  label,
  isSelected = false,
  disabled = false,
  disabledTooltip,
  onClick,
}: StepperTabProps) {
  const button = (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-disabled={disabled}
      tabIndex={isSelected ? 0 : -1}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "relative flex h-full w-full cursor-pointer items-center gap-2 rounded-[12px] py-1 pr-5 pl-3",
        disabled && "opacity-40",
      )}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 rounded-[12px] bg-white shadow-[13px_0_14px_rgba(211,216,216,0.4),0_1px_2px_rgba(99,196,184,0.2),0_0_10px_rgba(156,163,163,0.3)]"
          />
        )}
      </AnimatePresence>
      <div
        aria-hidden="true"
        className={cn(
          "text-label-3-semibold text-teal-gray-600 relative flex h-5 w-5 items-center justify-center rounded-full",
          isSelected ? "bg-teal-gray-150" : "bg-teal-gray-200",
        )}
      >
        {idx}
      </div>
      <span
        className={cn(
          "text-label-1-semibold relative",
          isSelected ? "text-teal-gray-800" : "text-teal-600",
        )}
      >
        {label}
      </span>
    </button>
  )

  return (
    <div
      className={cn(
        "relative flex h-9.5 w-full flex-1",
        disabled && "cursor-not-allowed",
      )}
    >
      {disabled && disabledTooltip ? (
        <Tooltip
          content={disabledTooltip}
          size="small"
          dark={true}
          side="top"
          triggerClassName="block w-full h-full"
        >
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </div>
  )
}
