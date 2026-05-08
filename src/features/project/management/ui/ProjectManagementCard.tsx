import { ProjectLogo } from "@/shared/assets/icon/logo/ProjectLogo"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import MemberCount from "@/shared/ui/MemberCount"

import { isRecruitDone } from "../../list/model/matchingProject"
import { ProjectManagementMoreMenu } from "./ProjectManagementMoreMenu"

import type { MatchingProject } from "../../list/model/matchingProject"

interface ProjectManagementCardProps {
  data: MatchingProject
}

export function ProjectManagementCard({ data }: ProjectManagementCardProps) {
  const cover = data.coverImage

  return (
    <div className="border-teal-gray-100 [&:hover:not(:has(button:hover))]:bg-teal-gray-100 shadow-drop-neutral-2 flex w-[56.25rem] items-center gap-7 rounded-2xl border bg-white py-2.5 pr-5 pl-2.5 transition-colors">
      <div className="bg-teal-gray-200 text-teal-gray-400 flex h-[10.5625rem] w-80 shrink-0 items-center justify-center overflow-hidden rounded-l-[0.625rem] text-center text-sm">
        {cover?.src ? (
          <img
            src={cover.src}
            alt={cover.alt ?? `${data.title} 대표 이미지`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          "프로젝트 대표 이미지 320*169"
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
            </div>
            <ProjectManagementMoreMenu />
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
  )
}
