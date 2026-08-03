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
import { useEffect, useMemo, useState } from "react"

import LeftChevronIcon from "@/shared/assets/icon/chevron/LeftChevronIcon"
import { Breadcrumb } from "@/shared/ui/breadcrumb/Breadcrumb"
import { Button } from "@/shared/ui/Button"
import { Segment } from "@/shared/ui/segment/Segment"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { INTERVIEW_ASSIGNMENT_LIMIT } from "../../api/recruitingApi"
import {
  useApplicantContacts,
  useInterviewScheduleBoard,
  useInterviewSessions,
} from "../../hooks/useInterviewSchedule"
import {
  useConfirmInterviewSchedules,
  useCreateInterviewSession,
  useDeleteInterviewSession,
  useUpdateInterviewSession,
} from "../../hooks/useInterviewScheduleMutations"
import {
  assignApplicant,
  formatDateTabLabel,
  isInterviewApplicant,
  parseSlotKey,
  resolveScheduleDates,
  splitApplicantsByAssignment,
  unassignApplicant,
} from "../../model/interviewSchedule"
import { INTERVIEW_SCHEDULE_ROUNDS_MOCK } from "../../model/interviewSchedule.mock"
import {
  buildAssignmentPayload,
  toApplicantAvailabilities,
  toAssignmentsFromBoard,
  toEditableSession,
  toInterviewApplicants,
  toKstTimeLabel,
  toSessionRequest,
} from "../../model/interviewScheduleMapper"
import { APPLICANT_POOL_ID, ApplicantPoolPanel } from "./ApplicantPoolPanel"
import { ApplicantChip } from "./DraggableApplicantChip"
import { type ScheduleStep, ScheduleStepTabs } from "./ScheduleStepTabs"
import { type EditableSession, SessionEditorList } from "./SessionEditorList"
import { SessionSlotBoard } from "./SessionSlotBoard"

import type {
  InterviewApplicant,
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

  // 차수 메타(학교명·제목·면접 기간)는 아직 목이다. 목록 화면 연동과 함께 걷어낸다.
  const round = INTERVIEW_SCHEDULE_ROUNDS_MOCK.find(
    (item) => item.roundId === roundId,
  )

  const dates = useMemo(
    () => resolveScheduleDates(round?.interviewStartAt, round?.interviewEndAt),
    [round?.interviewStartAt, round?.interviewEndAt],
  )

  const [activeDate, setActiveDate] = useState(dates[0] ?? "")
  const [step, setStep] = useState<ScheduleStep>("sessions")
  const currentDate = activeDate || dates[0] || ""

  const { sessions: serverSessions, isForbidden } =
    useInterviewSessions(roundId)
  const { board } = useInterviewScheduleBoard(roundId, currentDate)
  const { contactByApplicationId } = useApplicantContacts(roundId)

  const createSession = useCreateInterviewSession()
  const updateSession = useUpdateInterviewSession()
  const deleteSession = useDeleteInterviewSession()
  const confirmSchedules = useConfirmInterviewSchedules()

  // 세션 편집은 이 날짜에 속한 것만 다룬다. 서버 세션은 차수 전체로 오기 때문이다.
  const sessionsOfDate = useMemo(
    () =>
      serverSessions.filter(
        (session) =>
          toKstTimeLabel(session.startsAt) !== "" && session.startsAt,
      ),
    [serverSessions],
  )

  const [drafts, setDrafts] = useState<EditableSession[]>([])
  useEffect(() => {
    setDrafts(sessionsOfDate.map(toEditableSession))
  }, [sessionsOfDate])

  const boardSessions = useMemo(() => board?.sessions ?? [], [board])

  // 배정 상태는 서버 응답을 기준으로 두고, 드래그로 만든 변경만 위에 얹는다.
  const [localAssignments, setLocalAssignments] = useState<
    SlotAssignment[] | null
  >(null)
  useEffect(() => {
    setLocalAssignments(null)
  }, [board])

  const assignments = useMemo(
    () => localAssignments ?? toAssignmentsFromBoard(boardSessions),
    [localAssignments, boardSessions],
  )

  const applicants: InterviewApplicant[] = useMemo(() => {
    const availabilities = toApplicantAvailabilities(boardSessions)
    const all = [
      ...(board?.pendingApplicants ?? []),
      ...(board?.confirmedApplicants ?? []),
    ]
    return toInterviewApplicants(all, availabilities)
  }, [board, boardSessions])

  const applicantsById = useMemo(
    () => new Map(applicants.map((item) => [item.id, item])),
    [applicants],
  )
  const { waiting, assigned } = useMemo(
    () => splitApplicantsByAssignment(applicants, assignments),
    [applicants, assignments],
  )

  const [draggingApplicant, setDraggingApplicant] =
    useState<InterviewApplicant | null>(null)

  // 키보드만으로도 배정할 수 있어야 한다. PointerSensor 만 두면 마우스
  // 없이는 이 화면을 쓸 수 없다.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

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
      setLocalAssignments(unassignApplicant(assignments, applicant.id))
      return
    }

    const slot = parseSlotKey(String(over.id))
    if (!slot) return
    setLocalAssignments(
      assignApplicant(
        assignments,
        slot.sessionId,
        slot.slotStart,
        applicant.id,
      ),
    )
  }

  // 세션 시간을 한 칸 늘린다. 슬롯은 서버가 다시 계산해 준다.
  const handleAddSlotTime = (sessionId: string) => {
    const draft = drafts.find((item) => item.id === sessionId)
    if (!draft) return
    const [hour = "0", minute = "0"] = draft.endTime.split(":")
    const extended =
      Number(hour) * 60 + Number(minute) + draft.slotDurationMinutes
    if (extended > 23 * 60 + 59) return

    const nextEnd = `${String(Math.floor(extended / 60)).padStart(2, "0")}:${String(extended % 60).padStart(2, "0")}`
    void handleSaveSession({ ...draft, endTime: nextEnd })
  }

  const handleSaveSession = async (session: EditableSession) => {
    const payload = toSessionRequest(session, currentDate)
    if (!payload) {
      addToast({
        message: "면접 이름·시간·장소를 확인해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    // 새 행은 서버에서 발급한 id 를 받아야 배정 보드에서 슬롯을 붙일 수 있다.
    if (session.id.startsWith("draft-")) {
      await createSession.mutateAsync({ roundId, payload })
      return
    }
    await updateSession.mutateAsync({ roundId, sessionId: session.id, payload })
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (sessionId.startsWith("draft-")) {
      setDrafts((prev) => prev.filter((item) => item.id !== sessionId))
      return
    }
    await deleteSession.mutateAsync({ roundId, sessionId })
  }

  const handleConfirm = async () => {
    const { assignments: payload, skipped } = buildAssignmentPayload(
      assignments,
      currentDate,
      contactByApplicationId,
    )

    if (payload.length === 0) {
      addToast({
        message: "확정할 배정이 없습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    // 서버가 한 번에 받는 건수에 상한이 있다. 넘으면 조용히 잘리지 않게 막는다.
    if (payload.length > INTERVIEW_ASSIGNMENT_LIMIT) {
      addToast({
        message: `한 번에 ${INTERVIEW_ASSIGNMENT_LIMIT}건까지 확정할 수 있습니다. 날짜를 나눠 진행해주세요.`,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    if (skipped.length > 0) {
      addToast({
        message: `연락처를 찾지 못한 지원자 ${skipped.length}명은 확정에서 제외됩니다.`,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }

    await confirmSchedules.mutateAsync({
      roundId,
      payload: { assignments: payload },
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

  if (isForbidden) {
    return (
      <div className="flex w-full max-w-286.5 flex-col">
        <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 items-center justify-center rounded-[12px] border bg-white">
          이 화면을 조회할 권한이 없습니다.
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
          sessions={drafts}
          onChange={setDrafts}
          onSaveSession={handleSaveSession}
          onDeleteSession={handleDeleteSession}
          isSaving={createSession.isPending || updateSession.isPending}
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
              totalCount={applicants.length}
              waiting={waiting}
              assignedCount={assigned.length}
            />
            <SessionSlotBoard
              sessions={boardSessions}
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
              disabled={confirmSchedules.isPending}
              onClick={() => void handleConfirm()}
            >
              {confirmSchedules.isPending ? "확정 중..." : "일정 확정"}
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
