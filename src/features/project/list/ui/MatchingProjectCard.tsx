/** 피그마 기준 Project Card_Md입니다. */

import { isRecruitDone } from "@/features/project/list/model/matchingProject"
import { DEFAULT_MATCHING_PROJECT_MOCK } from "@/features/project/list/model/matchingProject.mock"
import { cn } from "@/shared/lib/utils"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import MemberCount from "@/shared/ui/MemberCount"
import { ProjectThumbnail } from "@/shared/ui/ProjectThumbnail"

import type {
  MatchingProject,
  ProjectRecruitRow,
} from "@/features/project/list/model/matchingProject"

export type MatchingProjectCardVariant =
  | "default"
  | "defaultAnimation"
  | "hoverAnimation"

interface MatchingProjectCardProps {
  variant?: MatchingProjectCardVariant
  data?: MatchingProject
}

function RecruitRowItem(row: ProjectRecruitRow) {
  const { part, current, total } = row
  const isDone = isRecruitDone(row)
  return (
    <div className="flex w-full min-w-0 items-center justify-between self-stretch">
      <div className="flex w-[7.3125rem] shrink-0 items-center justify-between">
        <span className="text-subtitle-4-semibold text-teal-gray-700 truncate">
          {part}
        </span>
        <MemberCount size="xs" current={current} total={total} />
      </div>
      <RecruitStatusChip done={isDone} className="shrink-0" />
    </div>
  )
}

function CardBody({ data }: { data: MatchingProject }) {
  const cover = data.coverImage
  const recruitRows = data.recruitRows.slice(0, 3)
  const recruitRowCount =
    recruitRows.length > 0 ? recruitRows.length : data.partQuotaStatus ? 1 : 0
  const placeholderRows = Array.from({
    length: Math.max(0, 3 - recruitRowCount),
  })

  return (
    <div className="flex w-full min-w-0 flex-col items-stretch self-stretch">
      <div className="bg-teal-gray-200 relative z-0 aspect-[348/184] w-full min-w-0 shrink-0 self-stretch overflow-hidden">
        <ProjectThumbnail
          src={cover?.src}
          alt={cover?.alt ?? `${data.title} 대표 이미지`}
        />
      </div>

      <div className="flex w-full min-w-0 flex-col items-start gap-4 p-5">
        <div className="flex w-full min-w-0 flex-col items-start justify-center gap-1.5 self-stretch">
          <h3 className="text-heading-7-semibold text-teal-gray-900 h-[1.575rem] w-full min-w-0 truncate">
            {data.title}
          </h3>
          <p className="text-body-2-medium text-teal-gray-600 h-[1.3125rem] w-full min-w-0 truncate">
            {data.description}
          </p>
          <p className="text-caption-2-regular text-teal-gray-500 line-clamp-1 w-full min-w-0">
            {data.authorSchoolLine}
          </p>
        </div>

        <div className="flex h-20 w-full min-w-0 flex-col items-start gap-1 self-stretch">
          {recruitRows.length > 0
            ? recruitRows.map((row) => (
                <RecruitRowItem key={row.part} {...row} />
              ))
            : data.partQuotaStatus != null && (
                <div className="flex w-full justify-end">
                  <RecruitStatusChip
                    done={data.partQuotaStatus === "COMPLETED"}
                  />
                </div>
              )}
          {placeholderRows.map((_, index) => (
            <div key={index} aria-hidden className="h-6 w-full shrink-0" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function MatchingProjectCard({
  variant = "default",
  data: dataProp,
}: MatchingProjectCardProps) {
  const data = dataProp ?? DEFAULT_MATCHING_PROJECT_MOCK
  const forcedHover = variant === "hoverAnimation"
  const interactiveHover =
    variant === "default" || variant === "defaultAnimation"

  return (
    <div
      className={cn(
        "bp2:max-w-[21.75rem] flex w-full min-w-0 flex-col items-center justify-end transition-[padding] duration-200 ease-out",
        forcedHover && "pt-0 pb-1",
        interactiveHover && "group pt-1 pb-0 hover:pt-0 hover:pb-1",
      )}
    >
      <div
        className={cn(
          "shadow-drop-neutral-4 relative flex w-full min-w-0 flex-col items-stretch overflow-hidden rounded-xl bg-white transition-transform duration-300 ease-in-out group-hover:duration-[650ms] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:duration-0",
          forcedHover && "-translate-y-1",
          interactiveHover && !forcedHover && "group-hover:-translate-y-1",
        )}
      >
        <CardBody data={data} />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 z-10 rounded-xl border-[1.5px] border-solid border-transparent transition-[border-color] delay-0 duration-200 ease-in-out group-hover:duration-[650ms] motion-reduce:transition-none motion-reduce:duration-0",
            forcedHover && "border-teal-300",
            interactiveHover && !forcedHover && "group-hover:border-teal-300",
          )}
        />
      </div>
    </div>
  )
}
