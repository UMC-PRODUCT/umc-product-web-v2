import { AnimatePresence, motion } from "motion/react"

import CollapseAllIcon from "@/shared/assets/icon/expand-collapse/CollapseAllIcon"
import ExpandAllIcon from "@/shared/assets/icon/expand-collapse/ExpandAllIcon"
import { cn } from "@/shared/lib/utils"

import type { ReactNode } from "react"

interface ExpandableTableHeadProps {
  children: ReactNode
  expanded?: boolean
  onToggle?: () => void
  className?: string
}

export function ExpandableTableHead({
  children,
  expanded = false,
  onToggle,
  className,
}: ExpandableTableHeadProps) {
  return (
    <div
      role="row"
      className={cn(
        "flex h-10 items-center rounded-t-xl bg-teal-100 pr-5.5 pl-2.5",
        className,
      )}
    >
      {children}
      {onToggle && (
        <button
          type="button"
          aria-label={expanded ? "모두 접기" : "모두 펼치기"}
          aria-expanded={expanded}
          onClick={onToggle}
          className="shadow-inner-neutral-2 flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-teal-100 transition-colors hover:bg-teal-200"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={expanded ? "collapse" : "expand"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {expanded ? (
                <CollapseAllIcon
                  aria-hidden="true"
                  width={24}
                  height={24}
                  className="text-teal-700"
                />
              ) : (
                <ExpandAllIcon
                  aria-hidden="true"
                  width={24}
                  height={24}
                  className="text-teal-700"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </button>
      )}
    </div>
  )
}
