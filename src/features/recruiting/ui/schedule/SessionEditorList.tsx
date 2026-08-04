import { useState } from "react"

import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import { SLOT_DURATION_UNIT_MINUTES } from "../../model/interviewScheduleMapper"

import type { InterviewMode } from "../../model/interviewSchedule"
import type { EditableSession } from "../../model/interviewScheduleMapper"

export type { EditableSession } from "../../model/interviewScheduleMapper"

const MODE_ITEMS: { id: InterviewMode; label: string }[] = [
  { id: "online", label: "비대면" },
  { id: "offline", label: "대면" },
]

// 서버가 15 의 배수만 받는다. 고르는 값만 두어 거부당할 일을 없앤다.
const SLOT_DURATION_OPTIONS = [15, 30, 45, 60]

const PLACE_PLACEHOLDER: Record<InterviewMode, string> = {
  online: "지원자들에게 안내될 면접 링크나 노션 링크를 작성해 주세요",
  offline: "지원자들에게 안내될 면접 위치를 작성해 주세요",
}

interface SessionEditorListProps {
  sessions: EditableSession[]
  onChange: (sessions: EditableSession[]) => void
  onSaveSession: (session: EditableSession) => Promise<void>
  onDeleteSession: (sessionId: string) => Promise<void>
  isSaving: boolean
}

export function SessionEditorList({
  sessions,
  onChange,
  onSaveSession,
  onDeleteSession,
  isSaving,
}: SessionEditorListProps) {
  const update = (id: string, partial: Partial<EditableSession>) => {
    onChange(
      sessions.map((session) =>
        session.id === id ? { ...session, ...partial } : session,
      ),
    )
  }

  // 삭제 확인 대상. 저장된 세션은 지우면 슬롯·배정까지 함께 사라지고 되돌릴 수
  // 없어서 바로 지우지 않는다.
  const [deleteTarget, setDeleteTarget] = useState<EditableSession | null>(null)

  const add = () => {
    const nextIndex = sessions.length + 1
    onChange([
      ...sessions,
      {
        // 서버 id 와 섞이지 않게 접두사를 둔다. 저장 시 이 접두사로 생성·수정을
        // 가른다. 길이 기반 번호는 행을 지웠다 다시 만들면 겹치므로 난수 id 를 쓴다.
        id: `draft-${crypto.randomUUID()}`,
        name: `면접 ${String.fromCharCode(64 + nextIndex)}`,
        startTime: "",
        endTime: "",
        mode: "online",
        place: "",
        slotDurationMinutes: 30,
      },
    ])
  }

  const requestDelete = (session: EditableSession) => {
    // 임시 행은 서버에 없는 것이라 바로 걷어낸다.
    if (session.id.startsWith("draft-")) {
      void onDeleteSession(session.id)
      return
    }
    setDeleteTarget(session)
  }

  return (
    <div className="shadow-drop-neutral-3 border-teal-gray-100 mt-6 flex flex-col gap-9 rounded-[12px] border bg-white px-8 py-9">
      {sessions.map((session) => (
        <div key={session.id} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              value={session.name}
              onChange={(event) =>
                update(session.id, { name: event.target.value })
              }
              placeholder="면접 이름을 입력해 주세요"
              aria-label="면접 이름"
              className="text-heading-6-semibold text-teal-gray-800 placeholder:text-teal-gray-300 flex-1 bg-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => requestDelete(session)}
              aria-label={`${session.name || "이름 없는 면접"} 삭제`}
              className="text-body-2-medium text-teal-gray-400 shrink-0 cursor-pointer hover:text-red-600"
            >
              삭제
            </button>
          </div>

          <div className="flex items-center gap-3">
            <TimeField
              value={session.startTime}
              onChange={(startTime) => update(session.id, { startTime })}
              label="시작 시각"
            />
            <span className="text-body-1-regular text-teal-gray-400">~</span>
            <TimeField
              value={session.endTime}
              onChange={(endTime) => update(session.id, { endTime })}
              label="종료 시각"
            />

            <select
              value={session.slotDurationMinutes}
              onChange={(event) =>
                update(session.id, {
                  slotDurationMinutes: Number(event.target.value),
                })
              }
              aria-label="지원자 1명당 면접 시간"
              className="border-teal-gray-200 text-body-2-regular text-teal-gray-700 h-11 rounded-[10px] border px-3 outline-none focus:border-teal-500"
            >
              {SLOT_DURATION_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes}분씩
                </option>
              ))}
            </select>

            <div
              role="radiogroup"
              aria-label="면접 진행 방식"
              className="border-teal-gray-200 ml-1 flex h-11 items-center overflow-hidden rounded-[10px] border"
            >
              {MODE_ITEMS.map((item) => {
                const selected = session.mode === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => update(session.id, { mode: item.id })}
                    className={cn(
                      "text-label-1-medium h-full w-22 cursor-pointer transition-colors",
                      selected
                        ? "bg-teal-50 text-teal-700"
                        : "text-teal-gray-500 hover:bg-teal-gray-100 bg-white",
                    )}
                  >
                    {/* aria-checked 가 이미 상태를 알린다. 체크 표시를 라벨에
                        넣으면 두 번 읽히고 선택할 때마다 버튼 폭이 흔들린다. */}
                    {selected && (
                      <span aria-hidden="true" className="mr-1">
                        ✓
                      </span>
                    )}
                    {item.label}
                  </button>
                )
              })}
            </div>

            <input
              value={session.place}
              onChange={(event) =>
                update(session.id, { place: event.target.value })
              }
              placeholder={PLACE_PLACEHOLDER[session.mode]}
              aria-label={session.mode === "online" ? "면접 링크" : "면접 위치"}
              className="border-teal-gray-200 text-body-2-regular text-teal-gray-700 placeholder:text-teal-gray-300 h-11 flex-1 rounded-[10px] border px-4 outline-none focus:border-teal-500"
            />

            <Button
              variant="weak"
              color="primary"
              size="s"
              disabled={isSaving}
              onClick={() => void onSaveSession(session)}
            >
              저장
            </Button>
          </div>

          {session.mode === "offline" && (
            <span className="text-label-1-medium text-teal-gray-400 pl-1">
              ex. 한국대학교 유엠관 107호
            </span>
          )}
          <span className="text-label-1-medium text-teal-gray-400 pl-1">
            지원자 1명당 면접 시간은 {SLOT_DURATION_UNIT_MINUTES}분 단위로만
            정할 수 있습니다.
          </span>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="text-body-2-medium text-teal-gray-600 flex w-fit cursor-pointer items-center gap-1 hover:text-teal-700"
      >
        <PlusIcon className="size-4" />
        면접 스케줄 추가
      </button>

      <CtaModal
        open={deleteTarget !== null}
        title="면접을 삭제할까요?"
        content={
          <>
            {deleteTarget?.name || "이름 없는 면접"} 을(를) 삭제하면
            <br />
            시간 슬롯과 지원자 배정도 함께 사라집니다.
          </>
        }
        cancelText="돌아가기"
        confirmText="삭제하기"
        variant="error"
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={() => {
          if (deleteTarget) void onDeleteSession(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}

function TimeField({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (value: string) => void
  label: string
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className="border-teal-gray-200 text-body-2-regular text-teal-gray-700 h-11 w-26 rounded-[10px] border px-4 text-center outline-none focus:border-teal-500"
    />
  )
}
