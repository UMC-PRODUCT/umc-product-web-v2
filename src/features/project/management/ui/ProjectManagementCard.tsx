import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { getProjectDetail } from "@/features/project/list/api/matchingProject"
import { ProjectDetailCard } from "@/features/project/list/ui/ProjectDetailCard"
import { ProjectLogo } from "@/shared/assets/icon/logo/ProjectLogo"
import { withImageCacheKey } from "@/shared/lib/withImageCacheKey"
import { ProjectStatusChip } from "@/shared/ui/chip/ProjectStatusChip"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import MemberCount from "@/shared/ui/MemberCount"
import { Modal } from "@/shared/ui/Modal"
import { ProjectThumbnail } from "@/shared/ui/ProjectThumbnail"

import { isRecruitDone } from "../../list/model/matchingProject"
import { useIsMatchingPeriod } from "../../new/hooks/useIsMatchingPeriod"
import { ProjectManagementMoreMenu } from "./ProjectManagementMoreMenu"

import type { MatchingProject } from "../../list/model/matchingProject"

interface ProjectManagementCardProps {
  data: MatchingProject
  canDeleteProject: boolean
  canEditProject: boolean
  canPublishProject: boolean
  isPermissionLoading: boolean
}

export function ProjectManagementCard({
  data,
  canDeleteProject,
  canEditProject,
  canPublishProject,
  isPermissionLoading,
}: ProjectManagementCardProps) {
  const isMatchingPeriod = useIsMatchingPeriod()
  const cover = data.coverImage
  const [open, setOpen] = useState(false)
  const projectId = Number(data.id)
  const hasValidProjectId = Number.isFinite(projectId) && projectId > 0
  const shouldFetchLogo = hasValidProjectId && !data.logoImage?.src
  const { data: projectDetail, dataUpdatedAt: projectDetailDataUpdatedAt } =
    useQuery({
      queryKey: ["projectDetail", projectId],
      queryFn: () => getProjectDetail(projectId),
      enabled: shouldFetchLogo,
      staleTime: 5 * 60 * 1000,
    })
  const logoSrc =
    data.logoImage?.src ??
    withImageCacheKey(projectDetail?.logoImageUrl, projectDetailDataUpdatedAt)
  const openDetailModal = () => {
    if (!hasValidProjectId) return
    setOpen(true)
  }

  return (
    <>
      <div
        className="border-teal-gray-100 [&:hover:not(:has(button:hover))]:bg-teal-gray-100 shadow-drop-neutral-2 bp1:p-4 bp2:flex-row bp2:items-center bp2:gap-7 bp2:py-2.5 bp2:pr-5 bp2:pl-2.5 flex w-full max-w-[56.25rem] min-w-0 cursor-pointer flex-col gap-4 rounded-2xl border bg-white p-3 transition-colors"
        role="button"
        tabIndex={0}
        onClick={openDetailModal}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openDetailModal()
        }}
      >
        <div className="bg-teal-gray-200 bp2:h-[10.5625rem] bp2:w-[clamp(13rem,28vw,20rem)] flex aspect-[320/169] w-full shrink-0 overflow-hidden rounded-[0.625rem]">
          <ProjectThumbnail
            src={cover?.src}
            alt={cover?.alt ?? `${data.title} 대표 이미지`}
          />
        </div>

        <div className="bp2:items-end flex min-w-0 flex-1 flex-col items-stretch gap-4">
          <div className="flex min-w-0 flex-col items-start gap-2 self-stretch">
            <div className="flex min-w-0 items-start justify-between gap-3 self-stretch">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <div className="shrink-0">
                  <ProjectLogo src={logoSrc ?? undefined} size={30} />
                </div>
                <span className="text-heading-7-semibold text-teal-gray-900 bp1:line-clamp-1 line-clamp-2 min-w-0">
                  {data.title}
                </span>
                <ProjectStatusChip status={data.status} className="shrink-0" />
              </div>
              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <ProjectManagementMoreMenu
                  projectId={data.id}
                  projectName={data.title}
                  chapterName={data.branch}
                  status={data.status}
                  recruitRows={data.recruitRows}
                  canDeleteProject={canDeleteProject}
                  canEditProject={canEditProject}
                  canPublishProject={canPublishProject}
                  isPermissionLoading={isPermissionLoading}
                  isMatchingPeriod={isMatchingPeriod}
                />
              </div>
            </div>

            <p className="text-body-2-medium text-teal-gray-500 line-clamp-1 w-full min-w-0">
              {data.authorSchoolLine}
            </p>
          </div>

          <div className="flex min-w-0 flex-col items-start gap-1.25 self-stretch">
            {data.recruitRows.map((row) => {
              const done = isRecruitDone(row)
              return (
                <div
                  key={row.part}
                  className="bp2:gap-3 flex min-w-0 items-center justify-between gap-2 self-stretch"
                >
                  <div className="bp2:w-[7.3125rem] bp2:flex-none bp2:shrink-0 flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="text-body-2-medium text-teal-gray-700 truncate">
                      {row.part}
                    </span>
                    <MemberCount
                      size="xs"
                      current={row.current}
                      total={row.total}
                    />
                  </div>
                  <RecruitStatusChip
                    done={done}
                    className="w-[3.875rem] shrink-0 text-xs leading-[150%] font-medium shadow-none"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content
            className="shadow-drop-neutral-3 rounded-2xl"
            aria-describedby={undefined}
          >
            <Modal.Title className="sr-only">{data.title}</Modal.Title>
            {hasValidProjectId && (
              <ProjectDetailCard
                projectId={projectId}
                showEditCta
                canEditProject={canEditProject}
                editPermissionLoading={isPermissionLoading}
                isMatchingPeriod={isMatchingPeriod}
              />
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}
