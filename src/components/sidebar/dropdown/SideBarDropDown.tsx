import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"

import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import { cn } from "@/shared/lib/utils"
import {
  useViewRoleStore,
  type ViewRole,
} from "@/shared/model/useViewRoleStore"

import { SideBarDropDownMenu } from "./SideBarDropDownMenu"

const DROPDOWN_ITEMS: { label: string; role: ViewRole }[] = [
  { label: "Admin View", role: "admin" },
  { label: "Challenger-Plan View", role: "challenger-plan" },
  { label: "Challenger-Others View", role: "challenger-others" },
]

export function SideBarDropDown() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const role = useViewRoleStore((s) => s.role)
  const setRole = useViewRoleStore((s) => s.setRole)

  const selectedIdx = DROPDOWN_ITEMS.findIndex((item) => item.role === role)
  const selectedLabel = DROPDOWN_ITEMS[selectedIdx]?.label

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-6.5 w-43 justify-between rounded-[8px] py-1 pr-2 pl-3",
          isOpen ? "bg-teal-gray-200" : "bg-teal-gray-150",
        )}
      >
        <span className="text-teal-gray-600 text-body-3-regular">
          {selectedLabel}
        </span>
        <DownChevronIcon className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <SideBarDropDownMenu
              items={DROPDOWN_ITEMS.map((item) => item.label)}
              selectedIdx={selectedIdx}
              onSelect={(idx) => {
                setRole(DROPDOWN_ITEMS[idx].role)
                setIsOpen(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
