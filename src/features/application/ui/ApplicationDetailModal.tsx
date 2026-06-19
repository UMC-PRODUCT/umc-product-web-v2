import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useEffect, useMemo, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { useResourcePermissionsBatch } from "@/features/auth/hooks/useResourcePermissionsBatch"
import { Modal } from "@/shared/ui/Modal"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import { updateApplicationDecision } from "../api/applicationApi"
import { applicationKeys } from "../api/applicationKeys"
import { useApplicationDetail } from "../hooks/useApplications"
import { toApplicantFormData, toServerStatus } from "../model/mappers"
import { isRoundDecisionClosed } from "../model/matchingDecision"
import { ModalApplicantPanel } from "./detail-modal/ModalApplicantPanel"
import { ModalFormPanel } from "./detail-modal/ModalFormPanel"

import type { ResourcePermissionQuery } from "@/features/auth/api/permissions"

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
}

function toApplicationId(applicantId: string): number | null {
  const id = Number(applicantId)
  return Number.isFinite(id) && id > 0 ? id : null
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

  // 지원자 없는 프로젝트 모달 오픈 시 토스트 노출
  useEffect(() => {
    if (!open) {
      emptyToastShownRef.current = false
      return
    }
    if (project.applicants.length === 0 && !emptyToastShownRef.current) {
      emptyToastShownRef.current = true
      addToast({
        message: "아직 지원한 챌린저가 없습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }, [open, addToast])

  const applicationIds = useMemo(() => {
    const ids = new Set<number>()
    for (const applicant of project.applicants) {
      const id = toApplicationId(applicant.id)
      if (id !== null) ids.add(id)
    }
    return Array.from(ids)
  }, [project.applicants])

  const approvePermissionQueries = useMemo<ResourcePermissionQuery[]>(
    () => [
      {
        resourceType: "PROJECT_APPLICATION",
        resourceIds: applicationIds,
        permissionTypes: ["APPROVE"],
      },
    ],
    [applicationIds],
  )

  const approvePermissionsQuery = useResourcePermissionsBatch(
    approvePermissionQueries,
    { enabled: open },
  )

  const isApprovePermissionLoading =
    open && applicationIds.length > 0 && approvePermissionsQuery.isPending

  const canApproveApplicant = (applicantId: string): boolean => {
    const applicationId = toApplicationId(applicantId)
    if (applicationId === null) return false
    return approvePermissionsQuery.hasPermission({
      resourceType: "PROJECT_APPLICATION",
      resourceId: applicationId,
      permissionType: "APPROVE",
    })
  }

  const projectWithOverrides = useMemo(() => {
    if (Object.keys(statusOverrides).length === 0) return project
    return {
      ...project,
      applicants: project.applicants.map((a) => {
        const override = statusOverrides[a.id]
        return override ? { ...a, status: override } : a
      }),
    }
  }, [project, statusOverrides])

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
    !isApprovePermissionLoading &&
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
                approvePermissionLoading={isApprovePermissionLoading}
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
