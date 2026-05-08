import { useState } from "react"

import LeftChevronIcon from "@/shared/assets/icon/chevron/LeftChevronIcon"
import PaginationChevronRightIcon from "@/shared/assets/icon/chevron/pagination/RightChevronIcon"
import { cn } from "@/shared/lib/utils"

import { CalendarDayCell } from "./CalendarDayCell"

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

interface CalendarProps {
  year?: number
  month?: number
  selectedDate?: Date | null
  highlightRange?: { start: Date; end: Date } | null
  onDateClick?: (date: Date) => void
  onMonthChange?: (year: number, month: number) => void
  className?: string
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month - 1, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function Calendar({
  year: controlledYear,
  month: controlledMonth,
  selectedDate = null,
  highlightRange = null,
  onDateClick,
  onMonthChange,
  className,
}: CalendarProps) {
  const today = new Date()
  const [internalYear, setInternalYear] = useState(
    controlledYear ?? today.getFullYear(),
  )
  const [internalMonth, setInternalMonth] = useState(
    controlledMonth ?? today.getMonth() + 1,
  )

  const year = controlledYear ?? internalYear
  const month = controlledMonth ?? internalMonth

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfWeek = getFirstDayOfWeek(year, month)
  const prevYear = month === 1 ? year - 1 : year
  const prevMonth = month === 1 ? 12 : month - 1
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

  const navigate = (delta: number) => {
    let newMonth = month + delta
    let newYear = year
    if (newMonth < 1) {
      newMonth = 12
      newYear--
    } else if (newMonth > 12) {
      newMonth = 1
      newYear++
    }
    if (onMonthChange) {
      onMonthChange(newYear, newMonth)
    } else {
      setInternalYear(newYear)
      setInternalMonth(newMonth)
    }
  }

  const totalSlots = firstDayOfWeek + daysInMonth
  const rowCount = Math.ceil(totalSlots / 7)
  const totalCells = rowCount * 7

  interface CellData {
    day: number
    isCurrentMonth: boolean
    date: Date
  }

  const cells: CellData[] = []

  for (let i = 0; i < totalCells; i++) {
    const offset = i - firstDayOfWeek
    if (offset < 0) {
      const d = daysInPrevMonth + offset + 1
      cells.push({
        day: d,
        isCurrentMonth: false,
        date: new Date(prevYear, prevMonth - 1, d),
      })
    } else if (offset >= daysInMonth) {
      const d = offset - daysInMonth + 1
      const nm = month === 12 ? 1 : month + 1
      const ny = month === 12 ? year + 1 : year
      cells.push({
        day: d,
        isCurrentMonth: false,
        date: new Date(ny, nm - 1, d),
      })
    } else {
      const d = offset + 1
      cells.push({
        day: d,
        isCurrentMonth: true,
        date: new Date(year, month - 1, d),
      })
    }
  }

  const getHighlightPosition = (date: Date) => {
    if (!highlightRange) return null
    const t = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime()
    const s = new Date(
      highlightRange.start.getFullYear(),
      highlightRange.start.getMonth(),
      highlightRange.start.getDate(),
    ).getTime()
    const e = new Date(
      highlightRange.end.getFullYear(),
      highlightRange.end.getMonth(),
      highlightRange.end.getDate(),
    ).getTime()
    if (t < s || t > e) return null
    if (s === e) return "single" as const
    if (t === s) return "start" as const
    if (t === e) return "end" as const
    return "middle" as const
  }

  return (
    <div
      className={cn(
        "border-teal-gray-100 flex w-95 flex-col gap-5 rounded-xl border bg-white px-5.5 py-5",
        className,
      )}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-subtitle-1-semibold text-teal-gray-900">
          {year}년 {String(month).padStart(2, "0")}월
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-teal-gray-400 hover:bg-teal-gray-100 flex h-6.5 w-6.5 cursor-pointer items-center justify-center rounded-lg hover:shadow-[inset_1px_1px_2px_rgba(211,216,216,0.2)]"
          >
            <LeftChevronIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            className="text-teal-gray-400 hover:bg-teal-gray-100 flex h-6.5 w-6.5 cursor-pointer items-center justify-center rounded-lg hover:shadow-[inset_1px_1px_2px_rgba(211,216,216,0.2)]"
          >
            <PaginationChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 그리드 */}
      <div className="grid grid-cols-7 gap-y-3">
        {/* 요일 라벨 */}
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "text-subtitle-2-medium flex h-9 items-center justify-center",
              i === 5 && "text-[#2883de]",
              i === 6 && "text-[#f64c4c]",
              i < 5 && "text-teal-gray-400",
            )}
          >
            {label}
          </div>
        ))}

        {/* 날짜 셀 */}
        {cells.map((cell, i) => {
          let state: "default" | "selected" | "active" | "disabled" = "default"
          if (!cell.isCurrentMonth) {
            state = "disabled"
          } else if (selectedDate && isSameDay(cell.date, selectedDate)) {
            state = "selected"
          }

          return (
            <CalendarDayCell
              key={i}
              day={cell.day}
              state={state}
              highlightPosition={
                cell.isCurrentMonth ? getHighlightPosition(cell.date) : null
              }
              onClick={
                cell.isCurrentMonth ? () => onDateClick?.(cell.date) : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}
