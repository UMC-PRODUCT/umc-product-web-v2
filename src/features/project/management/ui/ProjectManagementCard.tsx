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

  return (
    <>
      <div
        className="border-teal-gray-100 [&:hover:not(:has(button:hover))]:bg-teal-gray-100 shadow-drop-neutral-2 flex w-[56.25rem] cursor-pointer items-center gap-7 rounded-2xl border bg-white py-2.5 pr-5 pl-2.5 transition-colors"
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true)
        }}
      >
        <div className="bg-teal-gray-200 flex h-[10.5625rem] w-80 shrink-0 overflow-hidden rounded-[0.625rem]">
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

        <div className="flex flex-1 flex-col items-end gap-4">
          <div className="flex flex-col items-start gap-2 self-stretch">
            <div className="flex items-center justify-between self-stretch">
              <div className="flex items-center gap-2">
                <ProjectLogo size={30} />
                <span className="text-heading-7-semibold text-teal-gray-900">
                  {data.title}
                </span>
                <ProjectStatusChip status={data.status} />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
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

            <p className="text-body-2-medium text-teal-gray-500">
              {data.authorSchoolLine}
            </p>
          </div>

          <div className="flex flex-col items-start gap-1.25 self-stretch">
            {data.recruitRows.map((row) => {
              const done = isRecruitDone(row)
              return (
                <div
                  key={row.part}
                  className="flex items-center justify-between self-stretch"
                >
                  <div className="flex w-[7.3125rem] items-center justify-between">
                    <span className="text-body-2-medium text-teal-gray-700">
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
                    className="w-[3.875rem] text-xs leading-[150%] font-medium shadow-none"
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
            <ProjectDetailCard
              projectId={Number(data.id)}
              showEditCta
              canEditProject={canEditProject}
              editPermissionLoading={isPermissionLoading}
            />
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}
