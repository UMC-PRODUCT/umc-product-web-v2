import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { Popover } from "radix-ui"
import { useMemo, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { getProjectApplications } from "@/features/application/api/applicationApi"
import { applicationKeys } from "@/features/application/api/applicationKeys"
import {
  toApplicantDetail,
  toFrontRole,
} from "@/features/application/model/mappers"
import { ApplicationDetailModal } from "@/features/application/ui/ApplicationDetailModal"
import { getProjectDetail } from "@/features/project/list/api/matchingProject"
import { TeamMemberModal } from "@/features/project/list/ui/team-member-modal/TeamMemberModal"
import { deleteProject } from "@/features/project/management/api"
import { invalidateProjectSummaryQueries } from "@/features/project/new/api"
import { abortProject } from "@/features/project/new/api/projectAbort"
import { publishProject } from "@/features/project/new/api/projectPublish"
import MoreVerticalIcon from "@/shared/assets/icon/more/MoreVerticalIcon"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"
import { Modal } from "@/shared/ui/Modal"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import { AbortProjectModal } from "./AbortProjectModal"

import type { PartEnum } from "@/features/application/model/apiTypes"
import type {
  AssignmentCount,
  ProjectApplication,
  Role,
} from "@/features/application/model/types"
import type { ProjectStatus } from "@/features/project/list/api/matchingProject"
import type { ProjectRecruitRow } from "@/features/project/list/model/matchingProject"

interface ProjectManagementMoreMenuProps {
  projectId: string
  projectName: string
  chapterName: string
  status?: ProjectStatus
  recruitRows: ProjectRecruitRow[]
  canDeleteProject: boolean
  canEditProject: boolean
  canPublishProject: boolean
  isPermissionLoading: boolean
}

export function ProjectManagementMoreMenu({
  projectId,
  projectName,
  chapterName,
  status,
  recruitRows,
  canDeleteProject,
  canEditProject,
  canPublishProject,
  isPermissionLoading,
}: ProjectManagementMoreMenuProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [abortOpen, setAbortOpen] = useState(false)
  const [applicationOpen, setApplicationOpen] = useState(false)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const willOpenModalOnCloseRef = useRef(false)
  const addToast = useToastStore((s) => s.addToast)

  const numericProjectId = Number(projectId)

  const projectDetailQuery = useQuery({
    queryKey: ["projectDetail", numericProjectId],
    queryFn: () => getProjectDetail(numericProjectId),
    enabled: (applicationOpen || popoverOpen) && numericProjectId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const isPlanViewDisabled =
    !projectDetailQuery.isSuccess || !projectDetailQuery.data.externalLink

  const applicantsQuery = useQuery({
    queryKey: applicationKeys.applicants(numericProjectId),
    queryFn: () => getProjectApplications(numericProjectId),
    enabled: applicationOpen && numericProjectId > 0,
  })

  const projectApplication = useMemo((): ProjectApplication | null => {
    const detail = projectDetailQuery.data
    const applicants = applicantsQuery.data
    if (!detail || !applicants) return null

    const getCount = (parts: string[]): AssignmentCount => {
      let current = 0
      let total = 0
      for (const q of detail.partQuotas ?? []) {
        if (parts.includes(q.part)) {
          current += Number(q.currentCount)
          total += Number(q.quota)
        }
      }
      return { current, total }
    }

    return {
      id: String(detail.id),
      projectName: detail.name,
      role: "plan" as Role,
      parts: (detail.partQuotas ?? [])
        .filter(
          (q) => Number(q.quota) > 0 && q.part !== "PLAN" && q.part !== "ADMIN",
        )
        .map((q) => toFrontRole(q.part as PartEnum)),
      challengerName:
        detail.productOwner?.nickname || detail.productOwner?.name || "",
      challengerUniversity: detail.productOwner?.schoolName || "",
      statusLabel:
        detail.partQuotaStatus === "RECRUITING" ? "모집 중" : "모집 완료",
      designCount: getCount(["DESIGN"]),
      feCount: getCount(["WEB"]),
      beCount: getCount(["SPRINGBOOT", "NODEJS"]),
      applicants: applicants.map(toApplicantDetail),
    }
  }, [projectDetailQuery.data, applicantsQuery.data])

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(Number(projectId)),
    onSuccess: () => {
      setDeleteOpen(false)
      invalidateProjectSummaryQueries(queryClient, Number(projectId))
      void queryClient.invalidateQueries({
        queryKey: [...applicationKeys.all, "managed"],
      })
      addToast({
        message: "프로젝트가 삭제되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
    onError: () => {
      addToast({
        message: "프로젝트 삭제에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })

  const publishMutation = useMutation({
    mutationFn: () => publishProject(numericProjectId),
    onSuccess: () => {
      setPublishOpen(false)
      invalidateProjectSummaryQueries(queryClient, numericProjectId)
      addToast({
        message: "프로젝트가 공개되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
    onError: (error) => {
      const serverMessage = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined
      addToast({
        message:
          serverMessage ?? "프로젝트 공개에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })

  const abortMutation = useMutation({
    mutationFn: (reason: string) => abortProject(numericProjectId, reason),
    onSuccess: () => {
      setAbortOpen(false)
      invalidateProjectSummaryQueries(queryClient, numericProjectId)
      void queryClient.invalidateQueries({
        queryKey: [...applicationKeys.all, "managed"],
      })
      addToast({
        message: "프로젝트가 중단되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
    onError: (error) => {
      const serverMessage = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined
      addToast({
        message:
          serverMessage ?? "프로젝트 중단에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })

  const handleDeleteClick = () => {
    if (!canDeleteProject || isPermissionLoading) return
    willOpenModalOnCloseRef.current = true
    setPopoverOpen(false)
    setDeleteOpen(true)
  }

  const handleAbortClick = () => {
    if (!canPublishProject || isPermissionLoading) return
    willOpenModalOnCloseRef.current = true
    setPopoverOpen(false)
    setAbortOpen(true)
  }

  const handlePublishClick = () => {
    if (!canPublishProject || isPermissionLoading) return
    willOpenModalOnCloseRef.current = true
    setPopoverOpen(false)
    setPublishOpen(true)
  }

  const handleApplicationClick = () => {
    willOpenModalOnCloseRef.current = true
    setPopoverOpen(false)
    setApplicationOpen(true)
  }

  const handleEditClick = () => {
    if (!canEditProject || isPermissionLoading) return
    setPopoverOpen(false)
    navigate({
      to: "/matching/projects/new",
      search: { projectId: Number(projectId) },
    })
  }

  const handlePlanViewClick = () => {
    setPopoverOpen(false)
    const externalLink = projectDetailQuery.data?.externalLink
    if (!externalLink) return
    window.open(externalLink, "_blank", "noopener,noreferrer")
  }

  const handleTeamViewClick = () => {
    willOpenModalOnCloseRef.current = true
    setPopoverOpen(false)
    setTeamModalOpen(true)
  }

  const menuItems: {
    label: string
    onClick: () => void
    disabled?: boolean
  }[] = [
    { label: "지원 현황 확인하기", onClick: handleApplicationClick },
    {
      label: "기획 보기",
      onClick: handlePlanViewClick,
      disabled: isPlanViewDisabled,
    },
    { label: "팀원 구성 보기", onClick: handleTeamViewClick },
  ]

  if (isPermissionLoading || canEditProject) {
    menuItems.splice(2, 0, {
      label: "프로젝트 수정하기",
      onClick: handleEditClick,
      disabled: isPermissionLoading,
    })
  }

  return (
    <>
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Trigger asChild>
          <MoreVerticalIcon />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={10}
            avoidCollisions={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => {
              if (willOpenModalOnCloseRef.current) {
                e.preventDefault()
                willOpenModalOnCloseRef.current = false
              }
            }}
            className="shadow-drop-neutral-1 border-teal-gray-50 z-1100 flex w-38 flex-col items-start gap-1 rounded-lg border bg-white px-0.5 pt-2.5 pb-0.5"
          >
            <span className="text-label-3-semibold text-teal-gray-400 px-4">
              바로가기
            </span>

            <div className="flex w-full flex-col">
              {menuItems.map(({ label, onClick, disabled }) => (
                <DropdownItem
                  key={label}
                  label={label}
                  disabled={disabled}
                  onClick={onClick}
                />
              ))}
              {status === "PENDING_REVIEW" &&
                (isPermissionLoading || canPublishProject) && (
                  <DropdownItem
                    label="공개하기"
                    disabled={isPermissionLoading}
                    onClick={handlePublishClick}
                    className="text-teal-500"
                  />
                )}
              {status === "IN_PROGRESS" &&
                (isPermissionLoading || canPublishProject) && (
                  <DropdownItem
                    label="중단하기"
                    disabled={isPermissionLoading}
                    onClick={handleAbortClick}
                    className="text-error-500"
                  />
                )}
              {(isPermissionLoading || canDeleteProject) && (
                <DropdownItem
                  label="삭제"
                  disabled={isPermissionLoading}
                  onClick={handleDeleteClick}
                  className="text-error-500"
                />
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <Modal.Root open={teamModalOpen} onOpenChange={setTeamModalOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content aria-describedby={undefined}>
            <Modal.Title className="sr-only">팀원 구성</Modal.Title>
            <TeamMemberModal
              projectId={numericProjectId}
              recruitRows={recruitRows}
              onClose={() => setTeamModalOpen(false)}
            />
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      {projectApplication && (
        <ApplicationDetailModal
          project={projectApplication}
          chapterName={chapterName}
          open={applicationOpen}
          onOpenChange={setApplicationOpen}
        />
      )}

      <CtaModal
        open={deleteOpen}
        title="프로젝트 삭제"
        content={
          <>
            삭제한 프로젝트는 되돌릴 수 없습니다. <br /> '{projectName}'을
            삭제하시겠습니까?
          </>
        }
        cancelText="돌아가기"
        confirmText="삭제하기"
        confirmLoading={deleteMutation.isPending}
        variant="error"
        onOpenChange={setDeleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />

      <CtaModal
        open={publishOpen}
        title="프로젝트 공개"
        content={
          <>
            공개하면 챌린저들이 지원할 수 있습니다. <br /> '{projectName}'을
            공개하시겠습니까?
          </>
        }
        cancelText="돌아가기"
        confirmText="공개하기"
        confirmLoading={publishMutation.isPending}
        onOpenChange={setPublishOpen}
        onCancel={() => setPublishOpen(false)}
        onConfirm={() => publishMutation.mutate()}
      />

      <AbortProjectModal
        open={abortOpen}
        projectName={projectName}
        confirmLoading={abortMutation.isPending}
        onOpenChange={setAbortOpen}
        onCancel={() => setAbortOpen(false)}
        onConfirm={(reason) => abortMutation.mutate(reason)}
      />
    </>
  )
}
