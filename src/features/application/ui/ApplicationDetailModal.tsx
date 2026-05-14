import { useMemo, useState } from "react"

import { Modal } from "@/shared/ui/Modal"

import { useApplicationDetail } from "../hooks/useApplications"
import { toApplicantFormData } from "../model/mappers"
import { ModalApplicantPanel } from "./detail-modal/ModalApplicantPanel"
import { ModalFormPanel } from "./detail-modal/ModalFormPanel"

import type { ProjectApplication, StatusValue } from "../model/types"

interface ApplicationDetailModalProps {
  project: ProjectApplication
  chapterName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 현재 활성 차수 (이전 차수의 상태 칩 disabled 처리) */
  currentRound?: number
}

export function ApplicationDetailModal({
  project,
  chapterName,
  open,
  onOpenChange,
  currentRound,
}: ApplicationDetailModalProps) {
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null,
  )
  const [roundFilter, setRoundFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, StatusValue>
  >({})

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

  // 서버 formResponse -> 프론트 ApplicantFormData 변환
  const formData = useMemo(() => {
    if (!detailQuery.data?.formResponse || !selectedApplicantId) return null
    return toApplicantFormData(
      detailQuery.data.formResponse,
      selectedApplicantId,
    )
  }, [detailQuery.data, selectedApplicantId])

  const hasPanel = selectedApplicant !== null

  const handleClose = () => {
    onOpenChange(false)
    setSelectedApplicantId(null)
    setRoundFilter([])
    setStatusFilter([])
    setStatusOverrides({})
  }

  const handlePanelClose = () => {
    setSelectedApplicantId(null)
  }

  return (
    <Modal.Root
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}
    >
      <Modal.Portal>
        <Modal.Overlay tone="deep" />
        <Modal.Content
          className="flex max-h-[calc(100vh-60px)] items-start gap-4"
          onPointerDownOutside={(e) => {
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

          <div className="flex w-185 shrink-0 overflow-hidden rounded-xl bg-white shadow-xl">
            <ModalApplicantPanel
              project={projectWithOverrides}
              chapterName={chapterName}
              roundFilter={roundFilter}
              statusFilter={statusFilter}
              onRoundFilterChange={setRoundFilter}
              onStatusFilterChange={setStatusFilter}
              selectedApplicantId={selectedApplicantId}
              onApplicantClick={setSelectedApplicantId}
              onStatusChange={(id, status) =>
                setStatusOverrides((prev) => ({ ...prev, [id]: status }))
              }
              onClose={handleClose}
              currentRound={currentRound}
            />
          </div>

          {hasPanel && selectedApplicant && (
            <ModalFormPanel
              applicant={selectedApplicant}
              formData={formData}
              chapterName={chapterName}
              projectName={project.projectName}
              challengerName={project.challengerName}
              challengerUniversity={project.challengerUniversity}
              onStatusChange={(status) =>
                setStatusOverrides((prev) => ({
                  ...prev,
                  [selectedApplicantId!]: status,
                }))
              }
              onClose={handlePanelClose}
              statusDisabled={
                currentRound != null && selectedApplicant.round < currentRound
              }
              className="max-h-[calc(100vh-60px)] shadow-xl"
            />
          )}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  )
}
