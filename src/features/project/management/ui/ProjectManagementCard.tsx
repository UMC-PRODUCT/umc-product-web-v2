import { ProjectLogo } from "@/shared/assets/icon/logo/ProjectLogo"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import MemberCount from "@/shared/ui/MemberCount"

import { isRecruitDone } from "../../list/model/matchingProject"

import type { MatchingProject } from "../../list/model/matchingProject"

interface ProjectManagementCardProps {
  data: MatchingProject
}

export function ProjectManagementCard({ data }: ProjectManagementCardProps) {
  const cover = data.coverImage

  return (
    <div className="border-teal-gray-100 flex w-[56.25rem] items-center gap-7 rounded-2xl border bg-white py-2 pr-5 pl-2">
      <div className="bg-teal-gray-200 text-teal-gray-400 flex h-[10.5625rem] w-80 shrink-0 items-center justify-center overflow-hidden rounded-[0.625rem] text-center text-sm">
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
              <ProjectLogo />
              <span className="text-heading-6-semibold text-teal-gray-900">
                {data.title}
              </span>
            </div>
            <button
              type="button"
              className="flex h-[1.625rem] w-[1.625rem] items-center justify-center"
              aria-label="더보기"
            >
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path
                  d="M13.5 7.5C13.5 8.32843 12.8284 9 12 9C11.1716 9 10.5 8.32843 10.5 7.5C10.5 6.67157 11.1716 6 12 6C12.8284 6 13.5 6.67157 13.5 7.5Z"
                  fill="#404443"
                />
                <path
                  d="M13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12Z"
                  fill="#404443"
                />
                <path
                  d="M13.5 16.5C13.5 17.3284 12.8284 18 12 18C11.1716 18 10.5 17.3284 10.5 16.5C10.5 15.6716 11.1716 15 12 15C12.8284 15 13.5 15.6716 13.5 16.5Z"
                  fill="#404443"
                />
              </svg>
            </button>
          </div>

          <p className="text-body-2-medium text-teal-gray-600">
            {data.authorSchoolLine}
          </p>
        </div>

        <div className="flex flex-col items-start self-stretch">
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
                    size="sm"
                    current={row.current}
                    total={row.total}
                  />
                </div>
                <RecruitStatusChip done={done} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
