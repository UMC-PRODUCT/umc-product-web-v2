import { useMemo, useState } from "react"

import { Modal } from "@/shared/ui/Modal"

import { MOCK_FORM_DATA } from "../model/mockFormData"
import { ModalApplicantPanel } from "./detail-modal/ModalApplicantPanel"
import { ModalFormPanel } from "./detail-modal/ModalFormPanel"

import type { ProjectApplication, StatusValue } from "../model/types"

interface ApplicationDetailModalProps {
  project: ProjectApplication
  chapterName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApplicationDetailModal({
  project,
  chapterName,
  open,
  onOpenChange,
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

  const formData = selectedApplicantId
    ? (MOCK_FORM_DATA[selectedApplicantId] ?? null)
    : null

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
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay tone="light" />
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
              className="max-h-[calc(100vh-60px)] shadow-xl"
            />
          )}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  )
}
