import { cn } from "@/shared/lib/utils"

import { DateTextBox } from "./DateTextBox"
import { TimeTextBox } from "./TimeTextBox"

interface RoundFormProps {
  title: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  disabled?: boolean
  startDateError?: boolean
  endDateError?: boolean
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onStartTimeChange: (value: string) => void
  onEndTimeChange: (value: string) => void
  className?: string
}

export function RoundForm({
  title,
  startDate,
  endDate,
  startTime,
  endTime,
  disabled = false,
  startDateError = false,
  endDateError = false,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  className,
}: RoundFormProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h4 className="text-heading-7-semibold text-teal-600">{title}</h4>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <DateTextBox
            label="시작"
            value={startDate}
            disabled={disabled}
            error={startDateError}
            onChange={onStartDateChange}
          />
          <TimeTextBox
            value={startTime}
            disabled={disabled}
            onChange={onStartTimeChange}
          />
        </div>
        <span className="text-body-2-medium text-teal-gray-400">~</span>
        <div className="flex items-center gap-1.5">
          <DateTextBox
            label="종료"
            value={endDate}
            disabled={disabled}
            error={endDateError}
            onChange={onEndDateChange}
          />
          <TimeTextBox
            value={endTime}
            disabled={disabled}
            onChange={onEndTimeChange}
          />
        </div>
      </div>
    </div>
  )
}
