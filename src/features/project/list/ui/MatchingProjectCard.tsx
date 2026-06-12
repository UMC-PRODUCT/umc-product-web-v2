/** 피그마 기준 Project Card_Md입니다. */

import { isRecruitDone } from "@/features/project/list/model/matchingProject"
import { DEFAULT_MATCHING_PROJECT_MOCK } from "@/features/project/list/model/matchingProject.mock"
import { cn } from "@/shared/lib/utils"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import MemberCount from "@/shared/ui/MemberCount"

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

  return (
    <div className="flex w-full min-w-0 flex-col items-stretch self-stretch">
      <div className="bg-teal-gray-200 relative z-0 h-[11.5rem] w-full min-w-0 shrink-0 self-stretch overflow-hidden">
        {cover?.src ? (
          <img
            src={cover.src}
            alt={cover.alt ?? `${data.title} 대표 이미지`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="text-body-2-medium text-teal-gray-400 flex h-full w-full items-center justify-center py-1 text-center">
            프로젝트 대표 이미지
            <br />
            348*184
          </div>
        )}
      </div>

      <div className="flex w-full min-w-0 flex-col items-start gap-4 p-5">
        <div className="flex w-full min-w-0 flex-col items-start justify-center gap-1.5 self-stretch">
          <h3 className="text-heading-7-semibold text-teal-gray-900 line-clamp-1 w-full min-w-0">
            {data.title}
          </h3>
          <p className="text-body-2-medium text-teal-gray-600 line-clamp-2 w-full min-w-0">
            {data.description}
          </p>
          <p className="text-caption-2-regular text-teal-gray-500 line-clamp-1 w-full min-w-0">
            {data.authorSchoolLine}
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-col items-start gap-1 self-stretch">
          {data.recruitRows.length > 0
            ? data.recruitRows.map((row) => (
                <RecruitRowItem key={row.part} {...row} />
              ))
            : data.partQuotaStatus != null && (
                <div className="flex w-full justify-end">
                  <RecruitStatusChip
                    done={data.partQuotaStatus === "COMPLETED"}
                  />
                </div>
              )}
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
        "flex w-full max-w-[21.75rem] min-w-0 flex-col items-center justify-end transition-[padding] duration-200 ease-out",
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
