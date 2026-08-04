import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"

import { findAssignment } from "../../model/interviewSchedule"
import {
  toClientMode,
  toKstTimeLabel,
} from "../../model/interviewScheduleMapper"
import { DroppableSlotRow } from "./DroppableSlotRow"

import type { RecruitingBoardSession } from "../../api/types"
import type {
  InterviewApplicant,
  SlotAssignment,
} from "../../model/interviewSchedule"

const MODE_LABEL = { online: "비대면", offline: "대면" } as const

interface SessionSlotBoardProps {
  // 슬롯은 서버가 세션의 슬롯 길이로 계산해 내려준다. 클라이언트가 다시 만들지 않는다.
  sessions: RecruitingBoardSession[]
  assignments: SlotAssignment[]
  applicantsById: Map<string, InterviewApplicant>
  onAddSlotTime: (sessionId: string) => void
}

export function SessionSlotBoard({
  sessions,
  assignments,
  applicantsById,
  onAddSlotTime,
}: SessionSlotBoardProps) {
  if (sessions.length === 0) {
    return (
      <div className="shadow-drop-neutral-3 border-teal-gray-100 text-body-2-regular text-teal-gray-500 flex min-h-60 flex-1 items-center justify-center rounded-[12px] border bg-white">
        먼저 면접 시간과 장소를 등록해주세요.
      </div>
    )
  }

  return (
    <div className="shadow-drop-neutral-3 border-teal-gray-100 flex flex-1 flex-col gap-10 rounded-[12px] border bg-white px-7 py-7">
      {sessions.map((session) => (
        <section key={session.sessionId} className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-heading-6-semibold text-teal-gray-800">
                {session.name || "이름 없는 면접"}
              </h3>
              <span className="text-label-1-medium text-teal-gray-400">
                {MODE_LABEL[toClientMode(session.mode)]}
                {session.location ? ` | ${session.location}` : ""}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onAddSlotTime(session.sessionId)}
              className="text-body-2-medium text-teal-gray-600 flex shrink-0 cursor-pointer items-center gap-1 hover:text-teal-700"
            >
              <PlusIcon className="size-4" />
              면접 시간 추가
            </button>
          </div>

          {session.slots.length === 0 ? (
            <p className="text-body-2-regular text-teal-gray-400 py-6 text-center">
              면접 시간을 늘리면 슬롯이 만들어집니다.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {session.slots.map((slot) => {
                const start = toKstTimeLabel(slot.startsAt)
                const assignment = findAssignment(
                  assignments,
                  session.sessionId,
                  start,
                )
                return (
                  <DroppableSlotRow
                    key={slot.startsAt}
                    sessionId={session.sessionId}
                    slot={{ start, end: toKstTimeLabel(slot.endsAt) }}
                    applicant={
                      assignment
                        ? applicantsById.get(assignment.applicantId)
                        : undefined
                    }
                  />
                )
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
