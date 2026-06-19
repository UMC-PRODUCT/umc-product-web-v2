import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useEffect, useMemo, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { Modal } from "@/shared/ui/Modal"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import { updateApplicationDecision } from "../api/applicationApi"
import { applicationKeys } from "../api/applicationKeys"
import {
  useApplicationDetail,
  useProjectApplications,
} from "../hooks/useApplications"
import {
  toApplicantDetail,
  toApplicantFormData,
  toServerStatus,
} from "../model/mappers"
import { isRoundDecisionClosed } from "../model/matchingDecision"
import { ModalApplicantPanel } from "./detail-modal/ModalApplicantPanel"
import { ModalFormPanel } from "./detail-modal/ModalFormPanel"

import type { ProjectApplication, StatusValue } from "../model/types"

interface ApplicationDetailModalProps {
  project: ProjectApplication
  chapterName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 현재 활성 차수 (배정 안내 툴팁 분기용) */
  currentRound?: number
  /** 차수별 합/불 결정 마감(decisionDeadline) - 마감 지난 차수의 상태 변경 잠금 */
  decisionDeadlineByRound?: Map<number, number>
  /** APPLY-102 권한 없는 역할(SCHOOL_PRESIDENT 등) - 지원자 행 클릭 시 폼 패널 열리지 않음 */
  disableFormPanel?: boolean
  /** 플랜 챌린저(PM) 뷰: 대기 상태 옵션 숨김 */
  hidePendingStatus?: boolean
  /** 프로젝트 단위 합/불 결정 권한 (projects/permissions의 application.canDecide) */
  canDecide?: boolean
  /** 모달 오픈 시 미리 선택할 지원서 ID (챌린저 이름 클릭으로 지원서 상세 바로 열기) */
  initialApplicantId?: string
}

// 합/불 상태 변경 확인 모달 문구 (대기는 PM 뷰에서 노출되지 않으나 타입 완전성 위해 포함)
const DECISION_CONFIRM: Record<
  StatusValue,
  {
    title: string
    confirmText: string
    variant: "success" | "warning" | "error"
  }
> = {
  pass: {
    title: "합격 처리할까요?",
    confirmText: "합격 처리",
    variant: "success",
  },
  fail: {
    title: "불합격 처리할까요?",
    confirmText: "불합격 처리",
    variant: "warning",
  },
  pending: {
    title: "대기로 변경할까요?",
    confirmText: "변경",
    variant: "warning",
  },
}

const STATUS_LABEL: Record<StatusValue, string> = {
  pass: "합격",
  fail: "불합격",
  pending: "대기",
}

export function ApplicationDetailModal({
  project,
  chapterName,
  open,
  onOpenChange,
  currentRound,
  decisionDeadlineByRound,
  disableFormPanel = false,
  hidePendingStatus = false,
  canDecide = false,
  initialApplicantId,
}: ApplicationDetailModalProps) {
  const addToast = useToastStore((s) => s.addToast)

  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null,
  )
  const [roundFilter, setRoundFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, StatusValue>
  >({})
  // 합/불 변경 확인 모달 대기 상태 (확인 시에만 실제 반영)
  const [pendingDecision, setPendingDecision] = useState<{
    applicantId: string
    status: StatusValue
  } | null>(null)

  // 이중 실행 방지용 ref (Strict Mode 대응)
  const emptyToastShownRef = useRef(false)

  // admin 등 project.applicants가 비어 있으면 지원자 목록을 직접 조회(펼침 목록 캐시 재사용)
  const lazyApplicantsQuery = useProjectApplications(
    project.applicants.length === 0 ? Number(project.id) : 0,
  )
  const baseApplicants = useMemo(
    () =>
      project.applicants.length > 0
        ? project.applicants
        : (lazyApplicantsQuery.data ?? []).map(toApplicantDetail),
    [project.applicants, lazyApplicantsQuery.data],
  )

  // 지원자 없는 프로젝트 모달 오픈 시 토스트 노출 (lazy 로드 완료 후 실제 지원자 0명일 때만)
  useEffect(() => {
    if (!open) {
      emptyToastShownRef.current = false
      return
    }
    if (
      !initialApplicantId &&
      !lazyApplicantsQuery.isLoading &&
      baseApplicants.length === 0 &&
      !emptyToastShownRef.current
    ) {
      emptyToastShownRef.current = true
      addToast({
        message: "아직 지원한 챌린저가 없습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }, [
    open,
    addToast,
    initialApplicantId,
    baseApplicants.length,
    lazyApplicantsQuery.isLoading,
  ])

  // 합/불 결정 권한은 프로젝트 단위(application.canDecide)로 상위에서 전달받는다
  const canApproveApplicant = (_applicantId: string): boolean => canDecide

  // 챌린저 이름 클릭으로 지정된 지원자를 모달 오픈 시 선택 → 지원서 상세(폼) 바로 표시
  // 단, 폼 조회 권한이 없는 역할(disableFormPanel)은 목록만 보고 폼은 열지 않는다
  useEffect(() => {
    if (open && initialApplicantId && !disableFormPanel) {
      setSelectedApplicantId(initialApplicantId)
    }
  }, [open, initialApplicantId, disableFormPanel])

  const projectWithOverrides = useMemo(() => {
    const applicants =
      Object.keys(statusOverrides).length === 0
        ? baseApplicants
        : baseApplicants.map((a) => {
            const override = statusOverrides[a.id]
            return override ? { ...a, status: override } : a
          })
    return { ...project, applicants }
  }, [project, baseApplicants, statusOverrides])

  const selectedApplicant = selectedApplicantId
    ? (projectWithOverrides.applicants.find(
        (a) => a.id === selectedApplicantId,
      ) ?? null)
    : null

  // 지원서 상세 API 호출
  const projectId = Number(project.id)
  const applicationId = selectedApplicantId ? Number(selectedApplicantId) : 0
  const detailQuery = useApplicationDetail(projectId, applicationId)

  const queryClient = useQueryClient()
  const decisionMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: number; status: StatusValue }) =>
      updateApplicationDecision(projectId, appId, {
        status: toServerStatus(status),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
    onError: (error, variables) => {
      // 서버 에러 메시지 -> 사용자 친화 문구 변환
      const serverMessage = isAxiosError(error)
        ? error.response?.data?.message
        : undefined
      const displayMessage = serverMessage?.includes("최소 선발 인원")
        ? "팀 인원이 부족해 지금은 불합격 처리할 수 없습니다."
        : (serverMessage ?? "배정 상태 변경에 실패했습니다.")
      addToast({
        message: displayMessage,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      // 낙관적 업데이트 롤백
      setStatusOverrides((prev) => {
        const next = { ...prev }
        delete next[variables.appId]
        return next
      })
    },
  })

  // 서버 formResponse -> 프론트 ApplicantFormData 변환
  const formData = useMemo(() => {
    if (!detailQuery.data?.formResponse || !selectedApplicantId) return null
    return toApplicantFormData(
      detailQuery.data.formResponse,
      selectedApplicantId,
    )
  }, [detailQuery.data, selectedApplicantId])

  const hasPanel = selectedApplicant !== null

  const canChangeApplicantStatus = (
    applicantId: string,
    applicantRound: number,
  ): boolean =>
    canApproveApplicant(applicantId) &&
    !isRoundDecisionClosed(applicantRound, decisionDeadlineByRound, Date.now())

  const handleApplicantStatusChange = (
    applicantId: string,
    status: StatusValue,
  ) => {
    const applicant = projectWithOverrides.applicants.find(
      (item) => item.id === applicantId,
    )
    if (!applicant) return
    if (!canChangeApplicantStatus(applicant.id, applicant.round)) return
    if (applicant.status === status) return
    // 즉시 반영하지 않고 확인 모달을 띄운다
    setPendingDecision({ applicantId: applicant.id, status })
  }

  const handleConfirmDecision = () => {
    if (!pendingDecision) return
    const { applicantId, status } = pendingDecision
    setStatusOverrides((prev) => ({ ...prev, [applicantId]: status }))
    decisionMutation.mutate(
      { appId: Number(applicantId), status },
      { onSettled: () => setPendingDecision(null) },
    )
  }

  const handleClose = () => {
    onOpenChange(false)
    setSelectedApplicantId(null)
    setRoundFilter([])
    setStatusFilter([])
    setStatusOverrides({})
    setPendingDecision(null)
  }

  const handlePanelClose = () => {
    setSelectedApplicantId(null)
  }

  const pendingApplicant = pendingDecision
    ? (projectWithOverrides.applicants.find(
        (a) => a.id === pendingDecision.applicantId,
      ) ?? null)
    : null
  const decisionConfirm = pendingDecision
    ? DECISION_CONFIRM[pendingDecision.status]
    : null

  return (
    <>
      <Modal.Root
        open={open}
        onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}
      >
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content
            className="top-20! bottom-7.5! flex h-[calc(100vh-110px)]! translate-y-0! items-start gap-4"
            aria-describedby={undefined}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => {
              // 확인 모달 열려있으면 전체 모달은 그대로 유지
              if (pendingDecision) {
                e.preventDefault()
                return
              }
              // 우측 패널 열려있으면 패널만 닫고, 없으면 전체 닫기
              if (hasPanel) {
                e.preventDefault()
                handlePanelClose()
              }
            }}
            onPointerDownOutside={(e) => {
              // 확인 모달과 상호작용 중에는 전체 모달을 닫지 않는다
              if (pendingDecision) {
                e.preventDefault()
                return
              }
              const target = e.target as HTMLElement
              if (target.closest("[data-status-chip-dropdown]")) {
                e.preventDefault()
                return
              }
              handleClose()
            }}
          >
            <Modal.Title className="sr-only">
              {project.projectName} 지원 현황 상세
            </Modal.Title>

            <div className="flex h-full w-185 shrink-0 overflow-hidden rounded-xl bg-white shadow-xl">
              <ModalApplicantPanel
                project={projectWithOverrides}
                chapterName={chapterName}
                roundFilter={roundFilter}
                statusFilter={statusFilter}
                onRoundFilterChange={setRoundFilter}
                onStatusFilterChange={setStatusFilter}
                selectedApplicantId={selectedApplicantId}
                onApplicantClick={
                  disableFormPanel ? () => {} : setSelectedApplicantId
                }
                onStatusChange={handleApplicantStatusChange}
                onClose={handleClose}
                currentRound={currentRound}
                decisionDeadlineByRound={decisionDeadlineByRound}
                canApproveApplicant={canApproveApplicant}
                approvePermissionLoading={false}
                disableFormPanel={disableFormPanel}
                statusOptions={hidePendingStatus ? ["pass", "fail"] : undefined}
                className="w-full"
              />
            </div>

            {hasPanel && selectedApplicant && (
              <ModalFormPanel
                applicant={selectedApplicant}
                formData={formData}
                chapterName={chapterName}
                project={project}
                onStatusChange={(status) =>
                  handleApplicantStatusChange(selectedApplicant.id, status)
                }
                onClose={handlePanelClose}
                statusDisabled={
                  !canChangeApplicantStatus(
                    selectedApplicant.id,
                    selectedApplicant.round,
                  )
                }
                hidePendingStatus={hidePendingStatus}
                className="max-h-[calc(100vh-60px)] shadow-xl"
              />
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      {pendingDecision && pendingApplicant && decisionConfirm && (
        <CtaModal
          open
          title={decisionConfirm.title}
          content={
            <>
              {pendingApplicant.name} · {pendingApplicant.university} 지원자를{" "}
              {STATUS_LABEL[pendingDecision.status]} 처리합니다.
            </>
          }
          cancelText="취소"
          confirmText={decisionConfirm.confirmText}
          variant={decisionConfirm.variant}
          overlayTone="deep"
          confirmLoading={decisionMutation.isPending}
          onOpenChange={(next) => {
            if (!next && !decisionMutation.isPending) setPendingDecision(null)
          }}
          onCancel={() => {
            if (!decisionMutation.isPending) setPendingDecision(null)
          }}
          onConfirm={handleConfirmDecision}
        />
      )}
    </>
  )
}
