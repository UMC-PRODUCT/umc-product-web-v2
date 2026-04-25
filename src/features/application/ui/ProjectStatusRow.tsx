import { ChevronDown } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { ProjectLinkButton } from "@/shared/ui/button/ProjectLinkButton"
import { RoleTagChip } from "@/shared/ui/chip/RoleTagChip"

type Role =
  | "plan"
  | "design"
  | "web"
  | "ios"
  | "android"
  | "springboot"
  | "nodejs"

interface AssignmentCount {
  current: number
  total: number
}

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
  className,
}: ProjectStatusRowProps) {
  return (
    <div
      role="row"
      className={cn(
        "flex h-[68px] items-center gap-3 pr-[22px] pl-2.5 transition-colors",
        isExpanded
          ? "from-teal-gray-100/50 bg-gradient-to-r to-teal-50"
          : "border-teal-gray-150/50 hover:bg-teal-gray-50 border-b bg-white",
        className,
      )}
    >
      <div className="flex items-center">
        {/* 프로젝트 */}
        <div className="w-[200px] pr-4">
          <ProjectLinkButton
            name={projectName}
            isSelected={isExpanded}
            onClick={onProjectClick}
          />
        </div>

        {/* 파트 */}
        <div className="flex h-[50px] w-[122px] items-center px-2.5">
          <RoleTagChip role={role} />
        </div>

        {/* 챌린저 */}
        <div className="flex h-[50px] w-[200px] items-center rounded-lg px-4">
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
        <div className="flex h-[50px] w-[136px] items-center px-2.5">
          <span className="text-label-2-medium shadow-drop-neutral-2 inline-flex h-6 items-center justify-center rounded-md bg-teal-100 px-2 py-0.5 text-teal-600">
            {statusLabel}
          </span>
        </div>

        {/* Design 배정 */}
        <div className="flex h-[50px] w-[104px] items-center justify-center">
          <RatioCounter {...designCount} />
        </div>

        {/* FE 배정 */}
        <div className="flex h-[50px] w-[105px] items-center justify-center">
          <RatioCounter {...feCount} />
        </div>

        {/* BE 배정 */}
        <div className="flex h-[50px] w-[107px] items-center justify-center">
          <RatioCounter {...beCount} />
        </div>
      </div>

      {/* 확장/축소 버튼 */}
      <button
        type="button"
        aria-label={isExpanded ? "\uC811\uAE30" : "\uD3BC\uCE58\uAE30"}
        aria-expanded={isExpanded}
        onClick={onToggleExpand}
        className={cn(
          "shadow-inner-neutral-2 flex size-[30px] shrink-0 items-center justify-center rounded-[10px] transition-colors",
          isExpanded ? "bg-teal-100/50" : "hover:bg-teal-gray-150 bg-white",
        )}
      >
        <ChevronDown
          size={17}
          className={cn(
            "text-teal-gray-600 transition-transform",
            isExpanded && "rotate-180",
          )}
        />
      </button>
    </div>
  )
}
