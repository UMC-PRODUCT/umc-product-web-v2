import { useQuery } from "@tanstack/react-query"

import { projectKeys } from "@/features/project/new/api"
import SvgCloseIcon from "@/shared/assets/icon/close/CloseIcon"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"
import MemberCount from "@/shared/ui/MemberCount"

import { getProjectMembers } from "../../api/matchingProject"
import { TeamMemberRow } from "./TeamMemberRow"

import type { ProjectRecruitRow } from "../../model/matchingProject"

interface TeamMemberModalProps {
  projectId: number
  recruitRows: ProjectRecruitRow[]
  onClose: () => void
}

export function TeamMemberModal({
  projectId,
  recruitRows,
  onClose,
}: TeamMemberModalProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: projectKeys.members(projectId),
    queryFn: () => getProjectMembers(projectId),
    enabled: Number.isFinite(projectId),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className="relative flex max-h-[calc(100svh-4rem)] w-max max-w-[calc(100vw-2rem)] min-w-80 flex-col rounded-xl bg-white p-4">
      <button
        type="button"
        onClick={onClose}
        className="hover:bg-teal-gray-100 shadow-inner-neutral-2 absolute top-2.5 right-2.5 flex items-center justify-center rounded-lg transition-colors"
        aria-label="닫기"
      >
        <SvgCloseIcon width={26} height={26} />
      </button>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-[10px]">
        <h2 className="text-heading-6-semibold text-teal-gray-900">
          팀원 구성
        </h2>

        {isLoading || isError ? null : (
          <div className="flex flex-col gap-8">
            {(data?.partGroups ?? []).map((group) => {
              const recruitRow = recruitRows.find((r) => r.part === group.part)
              const total = recruitRow?.total ?? group.members.length
              const role = group.part.toLowerCase() as Parameters<
                typeof PartTagChip
              >[0]["role"]

              return (
                <div key={group.part} className="flex flex-col gap-2">
                  <div className="flex items-end justify-between">
                    <PartTagChip role={role} />
                    <MemberCount
                      size="xs"
                      current={group.members.length}
                      total={total}
                      className="text-teal-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {group.members.map((member, i) => (
                      <TeamMemberRow
                        key={member.memberId}
                        index={i + 1}
                        nickname={member.nickname}
                        name={member.name}
                        school={member.schoolName}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
