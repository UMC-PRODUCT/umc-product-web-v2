import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"

import DownChevronIcon from "@/assets/icon/chevron/SideBar/DownChevronIcon"
import { cn } from "@/lib/utils"

import { SideBarDropDownMenu } from "./SideBarDropDownMenu"

const DROPDOWN_ITEMS = [
  "Admin View",
  "Challenger-Plan View",
  "Challenger-Others View",
]

export function SideBarDropDown() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedIdx, setSelectedIdx] = useState<number>(0)

  const selectedLabel = DROPDOWN_ITEMS[selectedIdx]

  return (
    <>
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
              items={DROPDOWN_ITEMS}
              selectedIdx={selectedIdx}
              onSelect={setSelectedIdx}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
