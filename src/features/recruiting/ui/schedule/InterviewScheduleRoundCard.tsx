import { Link } from "@tanstack/react-router"

import { calcAllocationRate } from "../../model/interviewSchedule"

import type { InterviewScheduleRound } from "../../model/interviewSchedule.mock"

function formatPeriod(startAt: string, endAt: string) {
  const start = new Date(startAt)
  const end = new Date(endAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ""

  const pad = (value: number) => String(value).padStart(2, "0")
  const stamp = (date: Date, withYear: boolean) =>
    `${withYear ? `${date.getFullYear()}-` : ""}${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`

  return `${stamp(start, true)} ~ ${stamp(end, false)}`
}

interface InterviewScheduleRoundCardProps {
  round: InterviewScheduleRound
}

export function InterviewScheduleRoundCard({
  round,
}: InterviewScheduleRoundCardProps) {
  const rate = calcAllocationRate(round.assignedCount, round.totalCount)

  return (
    <Link
      to="/recruiting/evaluations/interview-schedule/$roundId"
      params={{ roundId: round.roundId }}
      className="shadow-drop-neutral-3 border-teal-gray-100 mt-4 flex items-center justify-between gap-6 rounded-[12px] border bg-white px-8 py-7 transition-colors hover:border-teal-300"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-heading-6-semibold text-teal-gray-800 truncate">
          {round.roundTitle}
        </span>
        <div className="text-body-2-regular text-teal-gray-400 flex items-center gap-2">
          <span>{round.documentClosedLabel}</span>
          <div className="bg-teal-gray-200 h-3 w-[1px] rounded-[0.5px]" />
          <span>
            면접 일정:{" "}
            {formatPeriod(round.interviewStartAt, round.interviewEndAt)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-body-2-medium text-teal-gray-600">
            면접 배정률
          </span>
          <span className="text-label-1-medium text-teal-gray-400">
            ({round.assignedCount}/{round.totalCount})
          </span>
          <span className="text-heading-6-semibold text-teal-600">{rate}%</span>
        </div>
        <div className="bg-teal-gray-100 h-1.5 w-45 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full bg-teal-500"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
