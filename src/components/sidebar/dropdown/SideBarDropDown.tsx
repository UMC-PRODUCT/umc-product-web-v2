import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"

import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import { cn } from "@/shared/lib/utils"

import { SideBarDropDownMenu } from "./SideBarDropDownMenu"

import type { ViewMode } from "@/shared/view-mode"

interface SideBarDropDownProps {
  options: ReadonlyArray<{ mode: ViewMode; label: string }>
  selectedIdx: number
  onSelect: (idx: number) => void
}

export function SideBarDropDown({
  options,
  selectedIdx,
  onSelect,
}: SideBarDropDownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedLabel = options[selectedIdx]?.label ?? options[0]?.label ?? ""

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
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex h-6.5 w-43 justify-between rounded-[8px] py-1 pr-2 pl-3",
          isOpen ? "bg-teal-gray-200" : "bg-teal-gray-150",
        )}
      >
        <span className="text-teal-gray-600 text-body-3-regular">
          {selectedLabel}
        </span>
        <DownChevronIcon
          className={cn(
            "text-teal-gray-400 h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
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
              items={options.map((item) => item.label)}
              selectedIdx={selectedIdx}
              onSelect={(idx) => {
                onSelect(idx)
                setIsOpen(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
