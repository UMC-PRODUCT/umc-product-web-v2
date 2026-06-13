import { useState } from "react"

import { ProjectDetailCard } from "@/features/project/list/ui/ProjectDetailCard"
import { ProjectLogo } from "@/shared/assets/icon/logo/ProjectLogo"
import { ProjectStatusChip } from "@/shared/ui/chip/ProjectStatusChip"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import MemberCount from "@/shared/ui/MemberCount"
import { Modal } from "@/shared/ui/Modal"

import { isRecruitDone } from "../../list/model/matchingProject"
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
  const cover = data.coverImage
  const [open, setOpen] = useState(false)
  const projectId = Number(data.id)
  const hasValidProjectId = Number.isFinite(projectId) && projectId > 0
  const openDetailModal = () => {
    if (!hasValidProjectId) return
    setOpen(true)
  }

  return (
    <>
      <div
        className="border-teal-gray-100 [&:hover:not(:has(button:hover))]:bg-teal-gray-100 shadow-drop-neutral-2 bp1:p-4 flex w-full max-w-[56.25rem] min-w-0 cursor-pointer flex-col gap-4 rounded-2xl border bg-white p-3 transition-colors min-[960px]:flex-row min-[960px]:items-center min-[960px]:gap-7 min-[960px]:py-2.5 min-[960px]:pr-5 min-[960px]:pl-2.5"
        role="button"
        tabIndex={0}
        onClick={openDetailModal}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openDetailModal()
        }}
      >
        <div className="bg-teal-gray-200 flex aspect-[320/169] w-full shrink-0 overflow-hidden rounded-[0.625rem] min-[960px]:h-[10.5625rem] min-[960px]:w-[clamp(13rem,28vw,20rem)]">
          {cover?.src ? (
            <img
              src={cover.src}
              alt={cover.alt ?? `${data.title} 대표 이미지`}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="text-body-2-medium text-teal-gray-400 flex h-full w-full items-center justify-center text-center">
              프로젝트 대표 이미지
              <br />
              320*169
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-stretch gap-4 min-[960px]:items-end">
          <div className="flex min-w-0 flex-col items-start gap-2 self-stretch">
            <div className="flex min-w-0 items-start justify-between gap-3 self-stretch">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <div className="shrink-0">
                  <ProjectLogo src={data.logoImage?.src} size={30} />
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
                  className="flex min-w-0 items-center justify-between gap-2 self-stretch min-[960px]:gap-3"
                >
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2 min-[960px]:w-[7.3125rem] min-[960px]:flex-none min-[960px]:shrink-0">
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
              />
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}
