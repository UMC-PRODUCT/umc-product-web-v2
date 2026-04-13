import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface StepperTabProps {
  idx: number
  label: string
  isSelected: boolean
  onClick: () => void
}

export function StepperTab({
  idx,
  label,
  isSelected = false,
  onClick,
}: StepperTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-9.5 w-full flex-1 cursor-pointer items-center gap-2 rounded-[12px] py-1 pr-5 pl-3"
    >
      {isSelected && (
        <motion.div
          layoutId="stepper-indicator"
          className="absolute inset-0 rounded-[12px] bg-white shadow-[13px_0_14px_rgba(211,216,216,0.4),0_1px_2px_rgba(99,196,184,0.2),0_0_10px_rgba(156,163,163,0.3)]"
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        />
      )}
      <div
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
}
