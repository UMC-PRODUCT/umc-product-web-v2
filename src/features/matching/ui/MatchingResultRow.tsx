import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import {
  addProjectMember,
  removeProjectMember,
} from "@/features/application/api/applicationApi"
import { applicationKeys } from "@/features/application/api/applicationKeys"
import { ProjectDetailCard } from "@/features/project/list/ui/ProjectDetailCard"
import { cn } from "@/shared/lib/utils"
import { ProjectLinkButton } from "@/shared/ui/button/ProjectLinkButton"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"
import { Modal } from "@/shared/ui/Modal"

import { AssignmentModal } from "./AssignmentModal"
import { MatchingBlock } from "./MatchingBlock"
import { MatchingDetailModal } from "./MatchingDetailModal"

import type { Part } from "@/features/challenger/model/types"
import type { MatchingProject } from "@/features/project/list/model/matchingProject"
import type { NumberTagVariant } from "@/shared/ui/NumberTag"

// 역할 행 라벨 -> 서버 Part enum 변환
function roleToPart(role: string, backendPart: "springboot" | "nodejs"): Part {
  if (role === "Frontend") return "WEB"
  if (role === "Backend")
    return backendPart === "nodejs" ? "NODEJS" : "SPRINGBOOT"
  if (role === "Design") return "DESIGN"
  return "WEB"
}

type BlockType = "round1" | "filled" | "none" | "blocked"

export interface MatchingBlockData {
  type: BlockType
  name?: string
  tagVariant?: NumberTagVariant
  applicantId?: string
  memberId?: number
}

export interface MatchingRoleRow {
  role: string
  blocks: MatchingBlockData[]
}

interface MatchingResultRowProps {
  projectId?: number
  projectName: string
  challengerName: string
  challengerUniversity: string
  backendPart: "springboot" | "nodejs"
  roleRows: MatchingRoleRow[]
  status: "recruiting" | "completed"
  currentCount?: number
  totalCount?: number
  projectData?: MatchingProject
  isEditable?: boolean
  gisuId?: number
  chapterId?: number
  approvedMemberIds?: Set<string>
  className?: string
}

export function MatchingResultRow({
  projectId,
  projectName,
  challengerName,
  challengerUniversity,
  backendPart,
  roleRows,
  status,
  currentCount,
  totalCount,
  isEditable = true,
  gisuId,
  chapterId,
  approvedMemberIds,
  className,
}: MatchingResultRowProps) {
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null,
  )
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<{
    rowIdx: number
    blockIdx: number
    role: string
  } | null>(null)
  const [localRoleRows, setLocalRoleRows] = useState(roleRows)
  const queryClient = useQueryClient()

  const assignMutation = useMutation({
    mutationFn: ({ memberId, part }: { memberId: number; part: string }) =>
      addProjectMember(projectId!, { memberId, part }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
    onError: () => {
      // 서버 실패 시 optimistic update 롤백
      setLocalRoleRows(roleRows)
    },
  })

  const unmatchMutation = useMutation({
    mutationFn: (memberId: number) => removeProjectMember(projectId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
    onError: () => {
      setLocalRoleRows(roleRows)
    },
  })

  useEffect(() => {
    setLocalRoleRows(roleRows)
  }, [roleRows])

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
                      isEditable && block.applicantId
                        ? () => {
                            setSelectedApplicantId(block.applicantId!)
                            setSelectedMemberId(block.memberId ?? null)
                          }
                        : undefined
                    }
                    onAssignClick={
                      isEditable && block.type === "none"
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
            {projectId && <ProjectDetailCard projectId={projectId} />}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <MatchingDetailModal
        applicantId={selectedApplicantId}
        projectId={projectId}
        memberId={selectedMemberId ?? undefined}
        chapterName="Chromium"
        projectName={projectName}
        challengerName={challengerName}
        challengerUniversity={challengerUniversity}
        open={selectedApplicantId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApplicantId(null)
            setSelectedMemberId(null)
          }
        }}
        isEditable={isEditable}
        onConfirmUnmatch={
          projectId && selectedMemberId
            ? () => unmatchMutation.mutate(selectedMemberId)
            : undefined
        }
      />

      {isEditable && (
        <AssignmentModal
          open={assignTarget !== null}
          onOpenChange={(open) => {
            if (!open) setAssignTarget(null)
          }}
          projectName={projectName}
          challengerName={challengerName}
          challengerUniversity={challengerUniversity}
          role={assignTarget?.role ?? ""}
          part={
            assignTarget
              ? roleToPart(assignTarget.role, backendPart)
              : undefined
          }
          gisuId={gisuId}
          chapterId={chapterId}
          approvedMemberIds={approvedMemberIds}
          onAssign={(challenger) => {
            if (!assignTarget) return
            // 로컬 UI 즉시 반영
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
                              memberId: Number(challenger.id),
                            }
                          : block,
                      ),
                    }
                  : row,
              ),
            )
            // 서버 API 호출
            if (projectId) {
              const part = roleToPart(assignTarget.role, backendPart)
              assignMutation.mutate({
                memberId: Number(challenger.id),
                part,
              })
            }
          }}
        />
      )}
    </div>
  )
}
