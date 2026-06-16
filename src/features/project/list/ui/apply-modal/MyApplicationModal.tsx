import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { useResourcePermission } from "@/features/auth/hooks/useResourcePermission"
import WarningTriangleIcon from "@/shared/assets/icon/infomation/WarningTriangleIcon"
import { Button } from "@/shared/ui/Button"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import { FormHeader } from "@/shared/ui/FormHeader"
import MemberCount from "@/shared/ui/MemberCount"
import { Modal } from "@/shared/ui/Modal"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"

import {
  type AnswerView,
  cancelApplication,
  getApplicationDetail,
  type QuestionView,
} from "../../api/matchingProject"
import { isRecruitDone } from "../../model/matchingProject"
import { ApplyProjectTitleCard } from "./ApplyProjectTitleCard"

import type { MyApplicationStatus } from "../../api/matchingProject"
import type { MatchingProject } from "../../model/matchingProject"

interface MyApplicationModalProps {
  data: MatchingProject
  projectId: number
  applicationId: number
  isRoundOpen: boolean
  onClose: () => void
  onCancelled: () => void
}

const STATUS_LABEL: Record<MyApplicationStatus, string> = {
  DRAFT: "임시 저장",
  SUBMITTED: "제출 완료",
  APPROVED: "합격",
  REJECTED: "불합격",
  CANCELLED: "취소됨",
}

export function MyApplicationModal({
  data,
  projectId,
  applicationId,
  isRoundOpen,
  onClose,
  onCancelled,
}: MyApplicationModalProps) {
  const addToast = useToastStore((s) => s.addToast)
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)
  const deletePermissionQuery = useResourcePermission(
    "PROJECT_APPLICATION",
    applicationId > 0 ? applicationId : undefined,
    { permissionType: "DELETE" },
  )

  const {
    data: detail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myApplicationDetail", projectId, applicationId],
    queryFn: () => getApplicationDetail(projectId, applicationId),
    enabled: applicationId > 0,
    staleTime: 60 * 1000,
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelApplication(projectId, applicationId),
    onSuccess: () => {
      setIsCancelConfirmOpen(false)
      addToast({
        message: "지원이 취소되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      onCancelled()
    },
    onError: () => {
      addToast({
        message: "지원 취소에 실패했습니다. 다시 시도해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })

  const isCancellableStatus =
    detail?.status === "DRAFT" || detail?.status === "SUBMITTED"
  const canDeleteApplication = deletePermissionQuery.hasPermission("DELETE")
  const isDeletePermissionLoading = deletePermissionQuery.isPending
  const shouldShowCancelButton =
    isCancellableStatus && (isDeletePermissionLoading || canDeleteApplication)
  const canCancel =
    isRoundOpen &&
    isCancellableStatus &&
    canDeleteApplication &&
    !isDeletePermissionLoading

  return (
    <div className="flex w-232 flex-col">
      <div className="flex w-full">
        <ApplyProjectTitleCard
          projectName={data.title}
          logoSrc={data.logoImage?.src}
          subtitle={data.authorSchoolLine}
        />
      </div>
      <div className="shadow-drop-neutral-3 flex w-full flex-col rounded-2xl bg-white">
        <div className="scrollbar-none max-h-[75vh] overflow-y-auto px-11.5 py-9">
          <div className="flex items-start gap-6 self-stretch px-1 py-5">
            <p className="text-body-1-regular text-teal-gray-600 flex-1">
              {data.description}
            </p>
            <div className="flex w-74.5 shrink-0 flex-col gap-1.25">
              {data.recruitRows.map((row) => {
                const done = isRecruitDone(row)
                return (
                  <div
                    key={row.part}
                    className="flex w-full items-center justify-between pr-1"
                  >
                    <div className="flex w-30.5 items-center justify-between">
                      <span className="text-body-2-medium text-teal-gray-700">
                        {row.part}
                      </span>
                      <MemberCount
                        size="sm"
                        current={row.current}
                        total={row.total}
                      />
                    </div>
                    <RecruitStatusChip done={done} />
                  </div>
                )
              })}
            </div>
          </div>

          {isError || applicationId === 0 ? (
            <div className="text-body-2-regular py-20 text-center text-red-400">
              지원 정보를 불러오지 못했습니다.
            </div>
          ) : isLoading || !detail ? (
            <div className="text-body-2-regular text-teal-gray-500 py-20 text-center">
              불러오는 중...
            </div>
          ) : (
            <>
              <div className="text-body-2-regular text-teal-gray-700 px-1 pb-4">
                지원 상태:{" "}
                <span className="font-semibold text-teal-600">
                  {STATUS_LABEL[detail.status]}
                </span>
                {detail.submittedAt && (
                  <span className="text-teal-gray-500 ml-3">
                    제출 일시: {formatDateTime(detail.submittedAt)}
                  </span>
                )}
              </div>
              <div className="flex w-full flex-col gap-5 pb-6">
                {detail.formResponse.sections.map((section) => {
                  const indexMap = new Map<string, number>()
                  section.questions.forEach((q, i) =>
                    indexMap.set(q.questionId, i + 1),
                  )

                  return (
                    <div key={section.sectionId}>
                      {section.type === "COMMON" ? (
                        <FormHeader variant="common" />
                      ) : (
                        <FormHeader
                          variant="part"
                          partName={section.allowedParts.join(", ")}
                          toggleChecked
                          showToggle={false}
                          onToggleChange={() => {}}
                        />
                      )}
                      {section.questions.length > 0 && (
                        <div className="flex flex-col items-start gap-10 self-stretch rounded-b-[12px] border border-teal-200 bg-white pt-8.5 pr-5 pb-9.5 pl-5">
                          {section.questions.map((q) => (
                            <div
                              key={q.questionId}
                              className="flex w-full flex-col gap-3"
                            >
                              <QuestionItemTitle
                                index={`Q${indexMap.get(q.questionId) ?? ""}`}
                                title={q.title}
                                caption={q.description}
                                required={q.isRequired}
                              />
                              <AnswerDisplay question={q} answer={q.answer} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="border-teal-gray-100 flex flex-col items-center gap-2 border-t px-6 py-4">
          <div className="flex justify-center gap-3">
            <Button variant="weak" color="neutral" size="xl" onClick={onClose}>
              닫기
            </Button>
            {shouldShowCancelButton && (
              <Button
                color="primary"
                size="xl"
                onClick={() => setIsCancelConfirmOpen(true)}
                disabled={!canCancel || cancelMutation.isPending}
              >
                지원 취소
              </Button>
            )}
          </div>
          {isCancellableStatus && !isRoundOpen && (
            <p className="text-caption-2-medium text-teal-gray-400">
              매칭 차수가 종료되어 취소할 수 없습니다.
            </p>
          )}
        </div>
      </div>

      <Modal.Root
        open={isCancelConfirmOpen}
        onOpenChange={setIsCancelConfirmOpen}
      >
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content className="shadow-drop-neutral-1 flex w-115 max-w-[calc(100vw-32px)] flex-col gap-8 rounded-[9.2px] border border-neutral-200 bg-white px-6 py-6 focus:outline-none">
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2">
                <WarningTriangleIcon className="h-6 w-6 text-teal-500" />
                <Modal.Title className="text-subtitle-1-semibold text-teal-500">
                  지원 취소
                </Modal.Title>
              </div>
              <Modal.Description className="text-subtitle-3-semibold text-teal-gray-800">
                지원을 취소하면 작성한 답변이 모두 사라집니다.
                <br />
                같은 매칭 차수가 진행 중이라면 다시 지원할 수 있습니다.
                <br />
                정말 취소하시겠어요?
              </Modal.Description>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="weak"
                color="neutral"
                size="s"
                onClick={() => setIsCancelConfirmOpen(false)}
                disabled={cancelMutation.isPending}
              >
                돌아가기
              </Button>
              <Button
                size="s"
                onClick={() => {
                  if (!canCancel) return
                  cancelMutation.mutate()
                }}
                disabled={!canCancel || cancelMutation.isPending}
              >
                지원 취소하기
              </Button>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </div>
  )
}

function AnswerDisplay({
  question,
  answer,
}: {
  question: QuestionView
  answer?: AnswerView
}) {
  const wrapperClass =
    "text-body-1-regular text-teal-gray-800 border-teal-gray-150 w-full rounded-[12px] border bg-[color-mix(in_srgb,var(--color-teal-50)_40%,white)] px-4 py-3 whitespace-pre-wrap break-words"
  const emptyClass =
    "text-body-1-regular text-teal-gray-400 border-teal-gray-150 w-full rounded-[12px] border bg-[color-mix(in_srgb,var(--color-teal-50)_40%,white)] px-4 py-3"

  if (!answer) {
    return <div className={emptyClass}>답변이 없습니다.</div>
  }

  switch (question.type) {
    case "SHORT_TEXT":
    case "LONG_TEXT":
      return (
        <div className={answer.textValue ? wrapperClass : emptyClass}>
          {answer.textValue || "답변이 없습니다."}
        </div>
      )
    case "RADIO":
    case "DROPDOWN":
    case "CHECKBOX": {
      const contents =
        answer.selectedOptions?.map((o) => o.answeredAsContent) ?? []
      if (contents.length === 0) {
        return <div className={emptyClass}>선택한 항목이 없습니다.</div>
      }
      return (
        <ul className={wrapperClass}>
          {contents.map((content, idx) => (
            <li key={`${content}-${idx}`}>• {content}</li>
          ))}
        </ul>
      )
    }
    case "FILE":
    case "PORTFOLIO": {
      const files = answer.files ?? []
      const linkText = answer.textValue
      if (files.length === 0 && !linkText) {
        return <div className={emptyClass}>첨부된 파일이 없습니다.</div>
      }
      return (
        <div className="flex w-full flex-col gap-1">
          {files.map((f) => (
            <a
              key={f.fileId}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${wrapperClass} block text-teal-600 underline`}
            >
              {f.originalFileName}
            </a>
          ))}
          {linkText && (
            <a
              href={linkText}
              target="_blank"
              rel="noopener noreferrer"
              className={`${wrapperClass} block text-teal-600 underline`}
            >
              {linkText}
            </a>
          )}
        </div>
      )
    }
    case "SCHEDULE": {
      const times = answer.times ?? []
      if (times.length === 0) {
        return <div className={emptyClass}>선택한 일정이 없습니다.</div>
      }
      return (
        <ul className={wrapperClass}>
          {times.map((t) => (
            <li key={t}>• {formatDateTime(t)}</li>
          ))}
        </ul>
      )
    }
  }
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const hh = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}
