import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"

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
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import { AssignmentModal } from "./AssignmentModal"
import { MatchingBlock } from "./MatchingBlock"

import type { Part } from "@/features/challenger/model/types"
import type { NumberTagVariant } from "@/shared/ui/NumberTag"

// 역할 행 라벨 -> 서버 Part enum 변환
function roleToPart(
  role: string,
  backendPart: "springboot" | "nodejs",
): Part | undefined {
  if (role === "Backend")
    return backendPart === "nodejs" ? "NODEJS" : "SPRINGBOOT"
  if (role === "Design") return "DESIGN"
  return undefined
}

type BlockType = "round1" | "filled" | "none" | "blocked"

export interface MatchingBlockData {
  type: BlockType
  name?: string
  tagVariant?: NumberTagVariant
  memberId?: string
  part?: Part
}

export interface MatchingRoleRow {
  role: string
  blocks: MatchingBlockData[]
  colsPerRow: number
}

interface MatchingResultRowProps {
  projectId?: string
  projectName: string
  challengerName: string
  challengerUniversity: string
  backendPart: "springboot" | "nodejs"
  roleRows: MatchingRoleRow[]
  status: "recruiting" | "completed"
  currentCount?: number
  totalCount?: number
  isEditable?: boolean
  gisuId?: number
  chapterId?: number
  assignedMemberIds?: Set<string>
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
  assignedMemberIds,
  className,
}: MatchingResultRowProps) {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<{
    rowIdx: number
    blockIdx: number
    role: string
    part?: Part
  } | null>(null)
  const [manualUnmatchTarget, setManualUnmatchTarget] = useState<{
    memberId: string
    name: string
  } | null>(null)
  const [localRoleRows, setLocalRoleRows] = useState(roleRows)
  // 수동 배정 후 서버 refetch 시 멤버를 클릭한 슬롯 위치로 재배치
  const lastAssignRef = useRef<{
    projectId?: string
    rowIdx: number
    blockIdx: number
    memberId: string
  } | null>(null)
  const queryClient = useQueryClient()

  const assignMutation = useMutation({
    mutationFn: ({ memberId, part }: { memberId: string; part: string }) =>
      addProjectMember(Number(projectId!), {
        memberId: Number(memberId),
        part,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
    onError: () => {
      // 서버 실패 시 optimistic update 롤백
      lastAssignRef.current = null
      setLocalRoleRows(roleRows)
    },
  })

  const unmatchMutation = useMutation({
    mutationFn: (memberId: string) =>
      removeProjectMember(Number(projectId!), Number(memberId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
    onError: () => {
      setLocalRoleRows(roleRows)
    },
  })

  useEffect(() => {
    if (!lastAssignRef.current) {
      setLocalRoleRows(roleRows)
      return
    }

    const {
      projectId: refProjectId,
      rowIdx,
      blockIdx,
      memberId,
    } = lastAssignRef.current
    if (refProjectId !== projectId) {
      lastAssignRef.current = null
      setLocalRoleRows(roleRows)
      return
    }
    const targetRow = roleRows[rowIdx]

    if (!targetRow) {
      lastAssignRef.current = null
      setLocalRoleRows(roleRows)
      return
    }

    const serverIdx = targetRow.blocks.findIndex((b) => b.memberId === memberId)

    if (serverIdx === -1) {
      // 아직 refetch 전 중간 렌더 - optimistic 상태 유지, ref 보존
      return
    }

    lastAssignRef.current = null

    if (serverIdx === blockIdx) {
      setLocalRoleRows(roleRows)
      return
    }

    // 서버가 채워진 블록을 항상 앞에 두므로, 클릭한 슬롯으로 재배치
    const newBlocks = [...targetRow.blocks]
    const block = newBlocks.splice(serverIdx, 1)[0]
    if (!block) {
      setLocalRoleRows(roleRows)
      return
    }
    newBlocks.splice(blockIdx, 0, block)

    setLocalRoleRows(
      roleRows.map((row, idx) =>
        idx === rowIdx ? { ...row, blocks: newBlocks } : row,
      ),
    )
  }, [roleRows, projectId])

  // 블록 배열을 colsPerRow 단위로 청크 분할
  const chunkedRows = localRoleRows.map((row) => {
    if (row.blocks.length === 0) return [[]]
    const chunks: MatchingBlockData[][] = []
    for (let i = 0; i < row.blocks.length; i += row.colsPerRow) {
      chunks.push(row.blocks.slice(i, i + row.colsPerRow))
    }
    return chunks
  })

  // 각 시각 행의 블록 수 (라운드 코너 비교용)
  const visualBlockCounts = chunkedRows.flatMap((chunks) =>
    chunks.map((c) => c.length),
  )
  const totalVisualRows = visualBlockCounts.length
  const assignPart = assignTarget
    ? (assignTarget.part ?? roleToPart(assignTarget.role, backendPart))
    : undefined

  return (
    <div
      className={cn("flex items-start gap-1.75 py-3 pr-5.5 pl-1.75", className)}
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
        {localRoleRows.map((row, rowIdx) => {
          const chunks = chunkedRows[rowIdx]!
          const visualBase = chunkedRows
            .slice(0, rowIdx)
            .reduce((sum, c) => sum + c.length, 0)

          return chunks.map((chunk, chunkIdx) => {
            const vIdx = visualBase + chunkIdx
            // 플랫 블록 인덱스 오프셋 (수동 배정용)
            const flatOffset = chunkIdx * row.colsPerRow
            // 연속 행은 라벨 없이 우측 정렬
            const isContinuation = chunkIdx > 0

            return (
              <div
                key={`${row.role}-${chunkIdx}`}
                className={cn(
                  "flex w-full items-center",
                  isContinuation ? "justify-end" : "justify-between",
                )}
              >
                <div
                  className={cn(
                    "flex items-center",
                    !isContinuation && "gap-3.5",
                  )}
                >
                  {!isContinuation && (
                    <span className="text-body-2-medium w-14.5 tracking-[-0.14px] text-teal-900">
                      {row.role}
                    </span>
                  )}
                  <div className="flex items-center">
                    {chunk.map((block, blockIdx) => {
                      const targetPart =
                        block.part ?? roleToPart(row.role, backendPart)

                      return (
                        <MatchingBlock
                          key={blockIdx}
                          type={block.type}
                          name={block.name}
                          tagVariant={block.tagVariant}
                          onNameClick={
                            isEditable &&
                            block.memberId &&
                            block.type === "filled"
                              ? () => {
                                  setManualUnmatchTarget({
                                    memberId: block.memberId!,
                                    name: block.name ?? "",
                                  })
                                }
                              : undefined
                          }
                          onAssignClick={
                            isEditable && block.type === "none" && targetPart
                              ? () =>
                                  setAssignTarget({
                                    rowIdx,
                                    blockIdx: flatOffset + blockIdx,
                                    role: row.role,
                                    part: targetPart,
                                  })
                              : undefined
                          }
                          className={(() => {
                            const aboveCount =
                              vIdx > 0 ? visualBlockCounts[vIdx - 1]! : 0
                            const belowCount =
                              vIdx < totalVisualRows - 1
                                ? visualBlockCounts[vIdx + 1]!
                                : 0
                            const isFirst = blockIdx === 0
                            const isLast = blockIdx === chunk.length - 1
                            return cn(
                              "-mr-px",
                              // 좌측: 모든 행의 좌측 끝 정렬 -> 위/아래 행 유무만 확인
                              isFirst && vIdx === 0 && "rounded-tl-[6px]",
                              isFirst &&
                                vIdx === totalVisualRows - 1 &&
                                "rounded-bl-[6px]",
                              // 우측: 첫 행(4칸)이 짧아 이후 행이 더 오른쪽으로 확장
                              isLast && vIdx === 0 && "rounded-tr-[6px]",
                              isLast &&
                                vIdx === totalVisualRows - 1 &&
                                "rounded-br-[6px]",
                              isLast &&
                                aboveCount < chunk.length &&
                                "rounded-tr-[6px]",
                              isLast &&
                                belowCount < chunk.length &&
                                "rounded-br-[6px]",
                            )
                          })()}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* 상태 표시 (첫 시각 행 우측) */}
                {rowIdx === 0 && chunkIdx === 0 && (
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
            )
          })
        })}
      </div>

      <Modal.Root
        open={isProjectModalOpen}
        onOpenChange={(open) => {
          if (!open) setIsProjectModalOpen(false)
        }}
      >
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content
            className="shadow-drop-neutral-3 rounded-2xl"
            aria-describedby={undefined}
          >
            {projectId && (
              <ProjectDetailCard
                projectId={projectId}
                projectChapterId={chapterId}
                viewOnly
              />
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <CtaModal
        open={manualUnmatchTarget !== null}
        variant="error"
        overlayTone="light"
        title="매칭을 해제하시겠습니까?"
        content={
          <>
            수동 배정된 챌린저 <strong>{manualUnmatchTarget?.name}</strong>의
            <br />
            매칭을 해제합니다.
          </>
        }
        cancelText="돌아가기"
        confirmText="매칭 해제"
        confirmLoading={unmatchMutation.isPending}
        onOpenChange={() => setManualUnmatchTarget(null)}
        onCancel={() => setManualUnmatchTarget(null)}
        onConfirm={() => {
          if (manualUnmatchTarget && projectId) {
            unmatchMutation.mutate(manualUnmatchTarget.memberId, {
              onSuccess: () => setManualUnmatchTarget(null),
            })
          }
        }}
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
          part={assignPart}
          gisuId={gisuId}
          chapterId={chapterId}
          assignedMemberIds={assignedMemberIds}
          onAssign={async (challenger) => {
            if (!assignTarget || !projectId) return
            // 배정 후 refetch 시 클릭한 슬롯으로 재배치하기 위해 저장
            lastAssignRef.current = {
              projectId,
              rowIdx: assignTarget.rowIdx,
              blockIdx: assignTarget.blockIdx,
              memberId: String(challenger.id),
            }
            // 로컬 UI 즉시 반영 (optimistic update)
            // 수동 배정은 항상 랜덤 매칭으로 표시
            const optimisticBlock: MatchingBlockData = {
              type: "filled" as const,
              name: challenger.nickname,
              tagVariant: "random" as NumberTagVariant,
              memberId: String(challenger.id),
              part: assignTarget.part,
            }
            setLocalRoleRows((prev) =>
              prev.map((row, rIdx) =>
                rIdx === assignTarget.rowIdx
                  ? {
                      ...row,
                      blocks: row.blocks.map((block, bIdx) =>
                        bIdx === assignTarget.blockIdx
                          ? optimisticBlock
                          : block,
                      ),
                    }
                  : row,
              ),
            )
            // 서버 API 호출 - 실패 시 throw해서 AssignmentModal에서 완료 모달 미표시
            const part =
              assignTarget.part ?? roleToPart(assignTarget.role, backendPart)
            if (!part) throw new Error("Missing assignment part")
            await assignMutation.mutateAsync({
              memberId: String(challenger.id),
              part,
            })
          }}
        />
      )}
    </div>
  )
}
