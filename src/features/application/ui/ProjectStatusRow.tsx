import { ChevronDown } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { ProjectLinkButton } from "@/shared/ui/button/ProjectLinkButton"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"

import type { AssignmentCount, Role } from "../model/types"

interface ProjectStatusRowProps {
  projectName: string
  role: Role
  challengerName: string
  challengerUniversity: string
  statusLabel: string
  designCount: AssignmentCount
  feCount: AssignmentCount
  beCount: AssignmentCount
  isExpanded?: boolean
  onToggleExpand?: () => void
  onProjectClick?: () => void
  hideExpandButton?: boolean
  className?: string
}

function RatioCounter({ current, total }: AssignmentCount) {
  return (
    <span className="text-body-1-medium inline-flex items-center gap-0.5">
      <span className="min-w-2.5 text-center text-teal-500">{current}</span>
      <span className="text-teal-gray-600">/</span>
      <span className="text-teal-gray-600 min-w-2.5 text-center">{total}</span>
    </span>
  )
}

export function ProjectStatusRow({
  projectName,
  role,
  challengerName,
  challengerUniversity,
  statusLabel,
  designCount,
  feCount,
  beCount,
  isExpanded = false,
  onToggleExpand,
  onProjectClick,
  hideExpandButton = false,
  className,
}: ProjectStatusRowProps) {
  return (
    <div
      role="row"
      className={cn(
        "flex h-17 items-center pr-5.5 pl-2.5 transition-colors",
        isExpanded
          ? "from-teal-gray-100/50 bg-linear-to-r to-teal-50"
          : "border-teal-gray-150/50 hover:bg-teal-gray-50 border-b bg-white",
        className,
      )}
    >
      <div className="flex flex-1 items-center">
        {/* 프로젝트 */}
        <ProjectLinkButton
          name={projectName}
          isSelected={isExpanded}
          onClick={onProjectClick}
          className="w-46 px-2.5"
        />

        {/* 파트 */}
        <div className="flex h-12.5 w-30.5 items-center justify-center px-2.5">
          <PartTagChip role={role} />
        </div>

        {/* 챌린저 */}
        <div className="flex h-12.5 w-50 items-center px-4">
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-body-2-medium text-teal-gray-900">
              {challengerName}
            </span>
            <span className="text-caption-3-regular text-teal-gray-600">
              {challengerUniversity}
            </span>
          </div>
        </div>

        {/* 상태 */}
        <div className="flex h-12.5 w-34 items-center justify-center px-2.5">
          <RecruitStatusChip done={statusLabel === "모집 완료"} size="md" />
        </div>

        {/* Design 배정 */}
        <div className="flex h-12.5 w-26 items-center justify-center">
          <RatioCounter {...designCount} />
        </div>

        {/* FE 배정 */}
        <div className="flex h-12.5 w-26.25 items-center justify-center">
          <RatioCounter {...feCount} />
        </div>

        {/* BE 배정 */}
        <div className="flex h-12.5 w-26.75 items-center justify-center">
          <RatioCounter {...beCount} />
        </div>
      </div>

      {/* 확장/축소 버튼 */}
      {!hideExpandButton && (
        <button
          type="button"
          aria-label={isExpanded ? "접기" : "펼치기"}
          aria-expanded={isExpanded}
          onClick={onToggleExpand}
          className={cn(
            "shadow-inner-neutral-2 flex size-7.5 shrink-0 items-center justify-center rounded-[10px] transition-colors",
            isExpanded ? "bg-teal-100/50" : "hover:bg-teal-gray-150 bg-white",
          )}
        >
          <ChevronDown
            size={30}
            className={cn(
              "text-teal-gray-600 transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </button>
      )}
    </div>
  )
}
