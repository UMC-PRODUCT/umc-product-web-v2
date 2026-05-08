import { useState } from "react"

import { ProjectDetailCard } from "@/features/project/list/ui/ProjectDetailCard"
import { cn } from "@/shared/lib/utils"
import { ProjectLinkButton } from "@/shared/ui/button/ProjectLinkButton"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"
import { Modal } from "@/shared/ui/Modal"

import { AssignmentModal } from "./AssignmentModal"
import { MatchingBlock } from "./MatchingBlock"
import { MatchingDetailModal } from "./MatchingDetailModal"

import type { MatchingProject } from "@/features/project/list/model/matchingProject"
import type { NumberTagVariant } from "@/shared/ui/NumberTag"

type BlockType = "round1" | "filled" | "none" | "blocked"

export interface MatchingBlockData {
  type: BlockType
  name?: string
  tagVariant?: NumberTagVariant
  applicantId?: string
}

export interface MatchingRoleRow {
  role: string
  blocks: MatchingBlockData[]
}

interface MatchingResultRowProps {
  projectName: string
  challengerName: string
  challengerUniversity: string
  backendPart: "springboot" | "nodejs"
  roleRows: MatchingRoleRow[]
  status: "recruiting" | "completed"
  currentCount?: number
  totalCount?: number
  projectData?: MatchingProject
  className?: string
}

export function MatchingResultRow({
  projectName,
  challengerName,
  challengerUniversity,
  backendPart,
  roleRows,
  status,
  currentCount,
  totalCount,
  projectData,
  className,
}: MatchingResultRowProps) {
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null,
  )
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<{
    rowIdx: number
    blockIdx: number
    role: string
  } | null>(null)
  const [localRoleRows, setLocalRoleRows] = useState(roleRows)

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
          onClick={() => setIsProjectModalOpen(true)}
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
          <PartTagChip role={backendPart} type="light" />
        </div>
      </div>

      {/* 역할별 블록 테이블 */}
      <div className="flex flex-1 flex-col gap-px">
        {localRoleRows.map((row, rowIdx) => (
          <div
            key={row.role}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-body-2-medium w-14.5 tracking-[-0.14px] text-teal-900">
                {row.role}
              </span>
              <div className="flex items-center overflow-clip">
                {row.blocks.map((block, blockIdx) => (
                  <MatchingBlock
                    key={blockIdx}
                    type={block.type}
                    name={block.name}
                    tagVariant={block.tagVariant}
                    onNameClick={
                      block.applicantId
                        ? () => setSelectedApplicantId(block.applicantId!)
                        : undefined
                    }
                    onAssignClick={
                      block.type === "none"
                        ? () =>
                            setAssignTarget({
                              rowIdx,
                              blockIdx,
                              role: row.role,
                            })
                        : undefined
                    }
                    className={cn(
                      "-mr-px",
                      rowIdx === 0 && blockIdx === 0 && "rounded-tl-[6px]",
                      rowIdx === 0 &&
                        blockIdx === row.blocks.length - 1 &&
                        "rounded-tr-[6px]",
                      rowIdx === localRoleRows.length - 1 &&
                        blockIdx === 0 &&
                        "rounded-bl-[6px]",
                      rowIdx === localRoleRows.length - 1 &&
                        blockIdx === row.blocks.length - 1 &&
                        "rounded-br-[6px]",
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
        ))}
      </div>

      <Modal.Root
        open={isProjectModalOpen}
        onOpenChange={(open) => {
          if (!open) setIsProjectModalOpen(false)
        }}
      >
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content className="shadow-drop-neutral-3 rounded-2xl">
            <ProjectDetailCard data={projectData} />
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <MatchingDetailModal
        applicantId={selectedApplicantId}
        chapterName="Chromium"
        projectName={projectName}
        challengerName={challengerName}
        challengerUniversity={challengerUniversity}
        open={selectedApplicantId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedApplicantId(null)
        }}
      />

      <AssignmentModal
        open={assignTarget !== null}
        onOpenChange={(open) => {
          if (!open) setAssignTarget(null)
        }}
        projectName={projectName}
        challengerName={challengerName}
        challengerUniversity={challengerUniversity}
        role={assignTarget?.role ?? ""}
        onAssign={(challenger) => {
          if (!assignTarget) return
          setLocalRoleRows((prev) =>
            prev.map((row, rIdx) =>
              rIdx === assignTarget.rowIdx
                ? {
                    ...row,
                    blocks: row.blocks.map((block, bIdx) =>
                      bIdx === assignTarget.blockIdx
                        ? {
                            type: "filled" as const,
                            name: challenger.nickname,
                            tagVariant: "random" as const,
                            applicantId: challenger.id,
                          }
                        : block,
                    ),
                  }
                : row,
            ),
          )
        }}
      />
    </div>
  )
}
