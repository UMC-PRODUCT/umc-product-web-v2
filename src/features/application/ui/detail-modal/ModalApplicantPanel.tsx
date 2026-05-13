import { Filter } from "lucide-react"
import { useMemo } from "react"

import { Tooltip } from "@/components/tooltip/Tooltip"
import CloseIcon from "@/shared/assets/icon/close/CloseIcon"
import InfoCircleIcon from "@/shared/assets/icon/infomation/InfoCircleIcon"
import { cn } from "@/shared/lib/utils"
import { OptionButton } from "@/shared/ui/option-button/OptionButton"
import { OptionButtonGroup } from "@/shared/ui/option-button/OptionButtonGroup"

import { ApplicantRoleSection } from "./ApplicantRoleSection"

import type {
  ApplicantDetail,
  ProjectApplication,
  Role,
  StatusValue,
} from "../../model/types"

interface ModalApplicantPanelProps {
  project: ProjectApplication
  chapterName: string
  roundFilter: string[]
  statusFilter: string[]
  onRoundFilterChange: (v: string[]) => void
  onStatusFilterChange: (v: string[]) => void
  selectedApplicantId: string | null
  onApplicantClick: (id: string) => void
  onStatusChange?: (applicantId: string, status: StatusValue) => void
  onClose: () => void
  currentRound?: number
  className?: string
}

export function ModalApplicantPanel({
  project,
  chapterName,
  roundFilter,
  statusFilter,
  onRoundFilterChange,
  onStatusFilterChange,
  selectedApplicantId,
  onApplicantClick,
  onStatusChange,
  onClose,
  currentRound,
  className,
}: ModalApplicantPanelProps) {
  const filteredApplicants = useMemo(() => {
    return project.applicants.filter((a) => {
      if (roundFilter.length > 0 && !roundFilter.includes(String(a.round)))
        return false
      if (statusFilter.length > 0 && !statusFilter.includes(a.status))
        return false
      return true
    })
  }, [project.applicants, roundFilter, statusFilter])

  const grouped = useMemo(() => {
    const map = new Map<Role, ApplicantDetail[]>()
    for (const a of filteredApplicants) {
      const list = map.get(a.role) ?? []
      list.push(a)
      map.set(a.role, list)
    }
    return map
  }, [filteredApplicants])

  const totalByRole = useMemo(() => {
    const map = new Map<Role, number>()
    for (const a of project.applicants) {
      map.set(a.role, (map.get(a.role) ?? 0) + 1)
    }
    return map
  }, [project.applicants])

  return (
    <div
      className={cn(
        "flex max-h-[calc(100vh-3.75rem)] shrink-0 flex-col",
        className,
      )}
    >
      {/* 헤더 */}
      <div className="flex flex-col gap-8 px-12.5 pt-14 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-4 px-2.5">
            <span className="text-subtitle-4-semibold text-teal-600">
              {chapterName}
            </span>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-heading-5-bold text-teal-gray-800">
                {project.projectName}
              </h2>
              <span className="text-body-2-medium text-teal-gray-600">
                {project.challengerName} · {project.challengerUniversity}
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2.5">
            <Tooltip
              content={
                <div className="text-left">
                  <p className="text-caption-2-bold text-teal-500">
                    지원자 배정 관리 Sheet
                  </p>
                  <p className="text-caption-2-regular text-teal-gray-600">
                    합격/불합격 결과는 각 매칭 차수 종료 시 자동 확정됩니다.
                    <br />각 차수 마감 전까지만 철회 가능하며, 이후에는 변경할
                    수 없습니다.
                  </p>
                </div>
              }
              size="big"
              dark={false}
              side="left"
              className="w-[20rem]"
            >
              <button
                type="button"
                className="shadow-inner-neutral-2 hover:bg-teal-gray-50 flex size-6.5 items-center justify-center rounded-lg transition-colors"
                aria-label="정보"
              >
                <InfoCircleIcon
                  width={16}
                  height={16}
                  className="text-teal-gray-600"
                />
              </button>
            </Tooltip>
            <button
              type="button"
              onClick={onClose}
              className="shadow-inner-neutral-2 hover:bg-teal-gray-50 flex size-6.5 items-center justify-center rounded-lg transition-colors"
              aria-label="닫기"
            >
              <CloseIcon
                width={18}
                height={18}
                className="text-teal-gray-600"
              />
            </button>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex items-center gap-2.5 px-2.5">
          <div className="flex items-center gap-1">
            <Filter size={16} className="text-teal-gray-600" />
            <span className="text-body-2-medium text-teal-gray-600">필터</span>
          </div>

          <div className="flex items-center gap-2">
            <OptionButtonGroup
              type="multiple"
              variant="segmented"
              value={roundFilter}
              onValueChange={onRoundFilterChange}
            >
              <OptionButton value="1" className="h-7">
                1차
              </OptionButton>
              <OptionButton value="2" className="h-7">
                2차
              </OptionButton>
              <OptionButton value="3" className="h-7">
                3차
              </OptionButton>
            </OptionButtonGroup>

            <OptionButtonGroup
              type="multiple"
              variant="segmented"
              value={statusFilter}
              onValueChange={onStatusFilterChange}
            >
              <OptionButton value="pass" className="h-7">
                합격
              </OptionButton>
              <OptionButton value="fail" className="h-7">
                불합격
              </OptionButton>
              <OptionButton value="pending" className="h-7">
                대기
              </OptionButton>
            </OptionButtonGroup>
          </div>
        </div>
      </div>

      {/* 스크롤 가능 리스트 */}
      <div className="scrollbar-none flex flex-1 flex-col gap-12.5 overflow-y-auto px-12.5 pt-4.5 pb-8.5">
        {Array.from(grouped.entries()).map(([role, applicants]) => (
          <ApplicantRoleSection
            key={role}
            role={role}
            applicants={applicants}
            totalCount={totalByRole.get(role) ?? 0}
            selectedApplicantId={selectedApplicantId}
            onApplicantClick={onApplicantClick}
            onStatusChange={onStatusChange}
            currentRound={currentRound}
          />
        ))}

        {grouped.size === 0 && (
          <div className="flex h-40 items-center justify-center">
            <span className="text-body-2-regular text-teal-gray-400">
              해당 조건의 지원자가 없습니다.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
