import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Popover } from "radix-ui"
import { useMemo, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { getProjectApplications } from "@/features/application/api/applicationApi"
import { applicationKeys } from "@/features/application/api/applicationKeys"
import { toApplicantDetail } from "@/features/application/model/mappers"
import { ApplicationDetailModal } from "@/features/application/ui/ApplicationDetailModal"
import { getProjectDetail } from "@/features/project/list/api/matchingProject"
import { deleteProject } from "@/features/project/management/api"
import MoreVerticalIcon from "@/shared/assets/icon/more/MoreVerticalIcon"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import type {
  AssignmentCount,
  ProjectApplication,
  Role,
} from "@/features/application/model/types"

interface ProjectManagementMoreMenuProps {
  projectId: string
  projectName: string
  chapterName: string
}

export function ProjectManagementMoreMenu({
  projectId,
  projectName,
  chapterName,
}: ProjectManagementMoreMenuProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [applicationOpen, setApplicationOpen] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  const numericProjectId = Number(projectId)

  const projectDetailQuery = useQuery({
    queryKey: ["projectDetail", numericProjectId],
    queryFn: () => getProjectDetail(numericProjectId),
    enabled: applicationOpen && numericProjectId > 0,
  })

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
          current += q.currentCount
          total += q.quota
        }
      }
      return { current, total }
    }

    return {
      id: String(detail.id),
      projectName: detail.name,
      role: "plan" as Role,
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
      void queryClient.invalidateQueries({ queryKey: ["project", "managed"] })
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

  const handleDeleteClick = () => {
    setPopoverOpen(false)
    setDeleteOpen(true)
  }

  const handleApplicationClick = () => {
    setPopoverOpen(false)
    setApplicationOpen(true)
  }

  const handleEditClick = () => {
    setPopoverOpen(false)
    navigate({
      to: "/matching/projects/new",
      search: { projectId: Number(projectId) },
    })
  }

  const handlePlanViewClick = async () => {
    setPopoverOpen(false)
    const newWindow = window.open(
      "about:blank",
      "_blank",
      "noopener,noreferrer",
    )
    try {
      const detail = await getProjectDetail(Number(projectId))
      if (detail.externalLink) {
        if (newWindow) newWindow.location.href = detail.externalLink
      } else {
        if (newWindow) newWindow.close()
        addToast({
          message: "등록된 기획안 링크가 없습니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      }
    } catch {
      if (newWindow) newWindow.close()
      addToast({
        message: "기획 보기를 불러오는 데 실패했습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }

  const MENU_ITEMS = [
    { label: "지원 현황 확인하기", onClick: handleApplicationClick },
    { label: "기획 보기", onClick: () => void handlePlanViewClick() },
    { label: "프로젝트 수정하기", onClick: handleEditClick },
    { label: "팀원 구성 보기", onClick: () => {} },
  ]

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
            className="shadow-drop-neutral-1 border-teal-gray-50 z-[1100] flex w-[9.5rem] flex-col items-start gap-1 rounded-lg border bg-white px-0.5 pt-2.5 pb-0.5"
          >
            <span className="text-label-3-semibold text-teal-gray-400 px-4">
              바로가기
            </span>

            <div className="flex w-full flex-col">
              {MENU_ITEMS.map(({ label, onClick }) => (
                <DropdownItem key={label} label={label} onClick={onClick} />
              ))}
              <DropdownItem
                label="삭제"
                onClick={handleDeleteClick}
                className="text-error-500"
              />
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

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
    </>
  )
}
