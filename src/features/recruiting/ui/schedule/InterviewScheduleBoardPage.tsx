import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import LeftChevronIcon from "@/shared/assets/icon/chevron/LeftChevronIcon"
import { Breadcrumb } from "@/shared/ui/breadcrumb/Breadcrumb"
import { Button } from "@/shared/ui/Button"
import { Segment } from "@/shared/ui/segment/Segment"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import {
  assignApplicant,
  canExtendEndTime,
  formatDateTabLabel,
  isInterviewApplicant,
  parseSlotKey,
  resolveScheduleDates,
  SLOT_STEP_MINUTES,
  splitApplicantsByAssignment,
  toMinutes,
  toTimeLabel,
  unassignApplicant,
} from "../../model/interviewSchedule"
import {
  INTERVIEW_APPLICANTS_MOCK,
  INTERVIEW_SCHEDULE_ROUNDS_MOCK,
  INTERVIEW_SESSIONS_MOCK,
} from "../../model/interviewSchedule.mock"
import { APPLICANT_POOL_ID, ApplicantPoolPanel } from "./ApplicantPoolPanel"
import { ApplicantChip } from "./DraggableApplicantChip"
import { type ScheduleStep, ScheduleStepTabs } from "./ScheduleStepTabs"
import { SessionEditorList } from "./SessionEditorList"
import { SessionSlotBoard } from "./SessionSlotBoard"

import type {
  InterviewApplicant,
  InterviewSession,
  SlotAssignment,
} from "../../model/interviewSchedule"

const LIST_PATH = "/recruiting/evaluations/interview-schedule"

interface InterviewScheduleBoardPageProps {
  roundId: string
}

export function InterviewScheduleBoardPage({
  roundId,
}: InterviewScheduleBoardPageProps) {
  const addToast = useToastStore((state) => state.addToast)
  const round = INTERVIEW_SCHEDULE_ROUNDS_MOCK.find(
    (item) => item.roundId === roundId,
  )

  const dates = useMemo(
    () => resolveScheduleDates(round?.interviewStartAt, round?.interviewEndAt),
    [round?.interviewStartAt, round?.interviewEndAt],
  )

  const [activeDate, setActiveDate] = useState(dates[0] ?? "")
  const [step, setStep] = useState<ScheduleStep>("sessions")
  const [sessionsByDate, setSessionsByDate] = useState<
    Record<string, InterviewSession[]>
  >({})
  const [assignmentsByDate, setAssignmentsByDate] = useState<
    Record<string, SlotAssignment[]>
  >({})
  const [draggingApplicant, setDraggingApplicant] =
    useState<InterviewApplicant | null>(null)

  // 키보드만으로도 배정할 수 있어야 한다. PointerSensor 만 두면 마우스
  // 없이는 이 화면을 쓸 수 없다.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const currentDate = activeDate || dates[0] || ""
  const sessions = sessionsByDate[currentDate] ?? INTERVIEW_SESSIONS_MOCK
  const assignments = useMemo(
    () => assignmentsByDate[currentDate] ?? [],
    [assignmentsByDate, currentDate],
  )

  const applicantsById = useMemo(
    () => new Map(INTERVIEW_APPLICANTS_MOCK.map((item) => [item.id, item])),
    [],
  )
  // 배정 여부는 차수 전체로 판정한다. 지금 날짜의 배정만 보면, 다른 날짜에
  // 이미 배정된 지원자가 대기 목록에 다시 나타나 두 슬롯을 차지하게 된다.
  const allAssignments = useMemo(
    () => Object.values(assignmentsByDate).flat(),
    [assignmentsByDate],
  )
  const { waiting, assigned } = useMemo(
    () =>
      splitApplicantsByAssignment(INTERVIEW_APPLICANTS_MOCK, allAssignments),
    [allAssignments],
  )

  const setSessions = (next: InterviewSession[]) => {
    setSessionsByDate((prev) => ({ ...prev, [currentDate]: next }))
  }

  // 한 지원자는 차수 전체에서 한 슬롯만 차지한다. 다른 날짜에 배정돼 있으면
  // 그 배정을 먼저 걷어낸다.
  const clearOtherDates = (
    prev: Record<string, SlotAssignment[]>,
    applicantId: string,
  ) => {
    const next: Record<string, SlotAssignment[]> = {}
    Object.entries(prev).forEach(([date, list]) => {
      next[date] =
        date === currentDate ? list : unassignApplicant(list, applicantId)
    })
    return next
  }

  const handleAddSlotTime = (sessionId: string) => {
    setSessions(
      sessions.map((session) => {
        if (session.id !== sessionId) return session
        const end = toMinutes(session.endTime)
        // 자정을 넘기면 시각을 되읽지 못해 이 세션의 슬롯이 전부 사라진다.
        if (end == null || !canExtendEndTime(session.endTime)) return session
        return { ...session, endTime: toTimeLabel(end + SLOT_STEP_MINUTES) }
      }),
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    const applicant = event.active.data.current
    if (!isInterviewApplicant(applicant)) return
    setDraggingApplicant(applicant)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingApplicant(null)
    const { active, over } = event
    if (!over) return

    const applicant = active.data.current
    if (!isInterviewApplicant(applicant)) return

    if (over.id === APPLICANT_POOL_ID) {
      // 대기 목록으로 되돌리면 어느 날짜에 배정돼 있든 전부 푼다.
      setAssignmentsByDate((prev) => {
        const cleared = clearOtherDates(prev, applicant.id)
        return {
          ...cleared,
          [currentDate]: unassignApplicant(
            cleared[currentDate] ?? [],
            applicant.id,
          ),
        }
      })
      return
    }

    const slot = parseSlotKey(String(over.id))
    if (!slot) return
    setAssignmentsByDate((prev) => {
      const cleared = clearOtherDates(prev, applicant.id)
      return {
        ...cleared,
        [currentDate]: assignApplicant(
          cleared[currentDate] ?? [],
          slot.sessionId,
          slot.slotStart,
          applicant.id,
        ),
      }
    })
  }

  const handleSave = () => {
    addToast({
      message: "면접 일정을 저장했습니다.",
      color: "primary",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
  }

  if (!round) {
    return (
      <div className="flex w-full max-w-286.5 flex-col">
        <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 items-center justify-center rounded-[12px] border bg-white">
          모집을 찾지 못했습니다. 목록에서 다시 진입해주세요.
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-286.5 flex-col gap-6">
      <div className="flex flex-col gap-5 pl-3">
        <Breadcrumb
          items={[
            { id: "recruiting", label: "리크루팅" },
            { id: "evaluation-management", label: "평가 관리" },
            { id: "interview-schedule", label: "면접 스케줄링", to: LIST_PATH },
          ]}
        />
        <Link
          to={LIST_PATH}
          className="text-body-2-medium text-teal-gray-500 hover:text-teal-gray-700 flex w-fit items-center gap-1"
        >
          <LeftChevronIcon width={16} height={16} />
          면접 스케줄링 목록으로
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-heading-4-semibold text-teal-gray-900">
            {round.schoolName}
          </h1>
          <span className="text-body-2-regular text-teal-gray-500">
            {round.roundTitle}
          </span>
        </div>
      </div>

      {dates.length > 0 && (
        <Segment
          items={dates.map((date) => ({
            id: date,
            label: formatDateTabLabel(date),
          }))}
          value={currentDate}
          onValueChange={setActiveDate}
        />
      )}

      <ScheduleStepTabs value={step} onValueChange={setStep} />

      {step === "sessions" ? (
        <SessionEditorList
          sessions={sessions}
          onChange={setSessions}
          onSave={handleSave}
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDraggingApplicant(null)}
        >
          <div className="flex items-start gap-6">
            <ApplicantPoolPanel
              totalCount={INTERVIEW_APPLICANTS_MOCK.length}
              waiting={waiting}
              assignedCount={assigned.length}
            />
            <SessionSlotBoard
              sessions={sessions}
              assignments={assignments}
              applicantsById={applicantsById}
              onAddSlotTime={handleAddSlotTime}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="fill"
              color="primary"
              size="m"
              onClick={handleSave}
            >
              저장하기
            </Button>
          </div>
          <DragOverlay>
            {draggingApplicant && (
              <ApplicantChip applicant={draggingApplicant} compact />
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
