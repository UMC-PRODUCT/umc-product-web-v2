import { ChevronDown, ChevronUp } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"

import { CurriculumSummary } from "./CurriculumSummary"

import type { CurriculumItem, Workbook } from "../model/curriculumData"

interface CurriculumCardReadonlyProps {
  curriculum: CurriculumItem
  isExpanded?: boolean
  onToggleExpand?: () => void
  onEdit?: () => void
}

function WorkbookItem({ wb }: { wb: Workbook }) {
  return (
    <div className="flex w-full flex-col gap-1.5 py-5 pr-6 pl-5">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-heading-7-semibold text-teal-600">
            WorkBook {wb.number}
          </span>
          <span className="text-heading-7-semibold text-teal-gray-900">
            {wb.title}
          </span>
        </div>
        <div className="p-px">
          <HamburgerIcon className="size-6 text-gray-700" />
        </div>
      </div>

      <ul className="flex flex-col gap-1 pl-23">
        {wb.missions.map((mission, idx) => (
          <li
            key={`${wb.id}-m-${idx}`}
            className="text-body-1-medium text-teal-gray-600 flex items-center gap-2"
          >
            <span>•</span>
            <span>{mission}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CurriculumCardReadonly({
  curriculum,
  isExpanded = true,
  onToggleExpand,
  onEdit,
}: CurriculumCardReadonlyProps) {
  const isTitleEmpty = curriculum.title.trim() === ""
  const displayCurriculumNumber = isTitleEmpty ? "00" : curriculum.number

  return (
    <div className="flex flex-col gap-1">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onToggleExpand?.()
          }
        }}
        className="group flex w-full cursor-pointer flex-col"
      >
        <div className="border-teal-gray-100 shadow-drop-neutral-2 flex w-full justify-between rounded-[16px] border bg-white px-6 py-7 transition-colors group-hover:border-teal-300">
          <div className="flex gap-[11px]">
            <span
              className={`text-heading-6-semibold transition-colors ${
                isTitleEmpty ? "text-teal-gray-400" : "text-teal-600"
              }`}
            >
              {displayCurriculumNumber}
            </span>
            <div className="flex flex-col gap-1 text-left">
              <span className="text-heading-6-semibold text-teal-gray-900 transition-colors group-hover:text-teal-600">
                {curriculum.title}
              </span>
              <CurriculumSummary
                workbookCount={curriculum.workbookCount}
                missionCount={curriculum.missionCount}
              />
            </div>
          </div>

          <div className="flex h-full items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.()
              }}
              className="hover:decoration-teal-gray-500 decoration-teal-gray-500 cursor-pointer px-1 py-0.5 hover:underline"
            >
              <span className="text-subtitle-2-medium text-teal-gray-500">
                수정
              </span>
            </button>

            <span className="flex items-center justify-center">
              {isExpanded ? (
                <ChevronUp className="text-teal-gray-700 size-7.5" />
              ) : (
                <ChevronDown className="text-teal-gray-700 size-7.5" />
              )}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col py-2">
              {curriculum.workbooks.map((wb) => (
                <WorkbookItem key={wb.id} wb={wb} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
