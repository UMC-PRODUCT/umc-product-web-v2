import { cn } from "@/shared/lib/utils"
import { ProjectLinkButton } from "@/shared/ui/button/ProjectLinkButton"
import { RoleTagChip } from "@/shared/ui/chip/RoleTagChip"

import { MatchingBlock } from "./MatchingBlock"

import type { NumberTagVariant } from "@/shared/ui/NumberTag"

type BlockType = "round1" | "filled" | "none" | "blocked"

export interface MatchingBlockData {
  type: BlockType
  name?: string
  tagVariant?: NumberTagVariant
}

export interface MatchingRoleRow {
  role: string
  blocks: MatchingBlockData[]
}

interface MatchingResultRowProps {
  projectName: string
  challengerName: string
  challengerUniversity: string
  partRole:
    | "plan"
    | "design"
    | "web"
    | "ios"
    | "android"
    | "springboot"
    | "nodejs"
  roleRows: MatchingRoleRow[]
  status: "recruiting" | "completed"
  currentCount?: number
  totalCount?: number
  onProjectClick?: () => void
  className?: string
}

export function MatchingResultRow({
  projectName,
  challengerName,
  challengerUniversity,
  partRole,
  roleRows,
  status,
  currentCount,
  totalCount,
  onProjectClick,
  className,
}: MatchingResultRowProps) {
  return (
    <div
      className={cn(
        "border-teal-gray-300 flex items-start gap-1.75 border-b py-3 pr-5.5 pl-1.75",
        className,
      )}
    >
      {/* 프로젝트 이동 버튼 */}
      <div className="w-42.5 shrink-0">
        <ProjectLinkButton
          name={projectName}
          onClick={onProjectClick}
          className="w-full"
        />
      </div>

      {/* 챌린저 정보 */}
      <div className="flex w-37.5 shrink-0 flex-col gap-6.75">
        <div className="flex h-12.5 items-center px-3.5">
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-body-2-medium text-teal-gray-900">
              {challengerName}
            </span>
            <span className="text-caption-3-regular text-teal-gray-600">
              {challengerUniversity}
            </span>
          </div>
        </div>
        <div className="px-1.5">
          <RoleTagChip role={partRole} type="light" />
        </div>
      </div>

      {/* 역할별 블록 테이블 */}
      <div className="flex flex-1 flex-col gap-px">
        {roleRows.map((row, rowIdx) => (
          <div key={row.role} className="flex items-center gap-3.5">
            {/* 역할 라벨 + 상태 (첫 행만) */}
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="text-body-2-medium w-14.5 tracking-[-0.14px] text-teal-900">
                  {row.role}
                </span>
                <div className="flex items-center">
                  {row.blocks.map((block, blockIdx) => (
                    <MatchingBlock
                      key={blockIdx}
                      type={block.type}
                      name={block.name}
                      tagVariant={block.tagVariant}
                      className={cn(
                        "-mr-px",
                        rowIdx === 0 && blockIdx === 0 && "rounded-tl-lg",
                        rowIdx === 0 &&
                          blockIdx === row.blocks.length - 1 &&
                          "rounded-tr-lg",
                        rowIdx === roleRows.length - 1 &&
                          blockIdx === 0 &&
                          "rounded-bl-lg",
                        rowIdx === roleRows.length - 1 &&
                          blockIdx === row.blocks.length - 1 &&
                          "rounded-br-lg",
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* 상태 표시 (첫 행 우측) */}
              {rowIdx === 0 && (
                <div className="flex items-center gap-1.5">
                  {status === "recruiting" && (
                    <div className="flex h-6 items-center gap-1.5">
                      <div className="bg-warning-500 size-3 rounded-full" />
                      <span className="text-label-2-medium text-warning-500">
                        모집 중
                      </span>
                    </div>
                  )}
                  <span className="text-subtitle-3-semibold tracking-[-0.16px] whitespace-nowrap text-teal-700">
                    {status === "recruiting"
                      ? `${currentCount}/${totalCount}명`
                      : `총 ${totalCount}명`}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
