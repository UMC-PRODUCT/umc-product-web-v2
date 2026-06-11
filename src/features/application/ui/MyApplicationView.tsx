import { Popover } from "radix-ui"
import { useState } from "react"

import { ProjectDetailCard } from "@/features/project/list/ui/ProjectDetailCard"
import { ProjectManagementSubTitle } from "@/features/project/management/ui/ProjectManagementSubTitle"
import MoreVerticalIcon from "@/shared/assets/icon/more/MoreVerticalIcon"
import { StatusChipTag } from "@/shared/ui/chip/StatusChipTag"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"
import { Modal } from "@/shared/ui/Modal"

import { ApplicationProjectCard } from "./ApplicationProjectCard"

import type { MyProjectApplicationResponse } from "@/features/project/list/api/matchingProject"

import type { StatusValue } from "../model/types"
import type { ApplicationProjectCardPart } from "./ApplicationProjectCard"

const PHASE_LABEL: Record<string, string> = {
  FIRST: "1차 매칭",
  SECOND: "2차 매칭",
  THIRD: "3차 매칭",
  RANDOM_MATCHING: "랜덤 매칭",
}

const ROUND_TYPE_LABEL: Record<string, string> = {
  PLAN_DESIGN: "Plan-Design",
}

const STATUS_MAP: Record<MyProjectApplicationResponse["status"], StatusValue> =
  {
    APPROVED: "pass",
    REJECTED: "fail",
    SUBMITTED: "pending",
    DRAFT: "pending",
    CANCELLED: "pending",
  }

function toRoundLabel(type: string, phase: string): string {
  const typeLabel = ROUND_TYPE_LABEL[type] ?? type
  const phaseLabel = PHASE_LABEL[phase] ?? phase
  return `${typeLabel} ${phaseLabel}`
}

function toPmInfo(
  owner: MyProjectApplicationResponse["project"]["productOwner"],
): string {
  const namepart =
    owner.nickname && owner.name
      ? `${owner.nickname}/${owner.name}`
      : (owner.name ?? "")
  return [namepart, owner.schoolName].filter(Boolean).join(" · ")
}

function toParts(
  partQuotas: MyProjectApplicationResponse["project"]["partQuotas"],
): ApplicationProjectCardPart[] {
  return partQuotas.map((q) => ({
    label: q.part,
    current: q.currentCount,
    total: q.quota,
    done: q.status === "COMPLETED",
  }))
}

// TODO: API 연동 후 제거
const MOCK_DATA: MyProjectApplicationResponse[] = [
  {
    applicationId: 1,
    projectId: 1,
    project: {
      name: "UMC_Web",
      thumbnailImageUrl: null,
      productOwner: {
        memberId: 1,
        nickname: "이방토",
        name: "이예원",
        schoolName: "한양대 ERICA",
      },
      partQuotas: [
        { part: "DESIGN", currentCount: 1, quota: 1, status: "RECRUITING" },
        { part: "WEB", currentCount: 1, quota: 1, status: "COMPLETED" },
        { part: "SPRINGBOOT", currentCount: 1, quota: 1, status: "COMPLETED" },
      ],
    },
    matchingRound: { id: 1, type: "PLAN_DESIGN", phase: "FIRST" },
    status: "REJECTED",
  },
  {
    applicationId: 2,
    projectId: 1,
    project: {
      name: "UMC_Web",
      thumbnailImageUrl: null,
      productOwner: {
        memberId: 1,
        nickname: "이방토",
        name: "이예원",
        schoolName: "한양대 ERICA",
      },
      partQuotas: [
        { part: "DESIGN", currentCount: 1, quota: 1, status: "RECRUITING" },
        { part: "WEB", currentCount: 1, quota: 1, status: "COMPLETED" },
        { part: "SPRINGBOOT", currentCount: 1, quota: 1, status: "COMPLETED" },
      ],
    },
    matchingRound: { id: 2, type: "PLAN_DESIGN", phase: "SECOND" },
    status: "REJECTED",
  },
  {
    applicationId: 3,
    projectId: 1,
    project: {
      name: "UMC_Web",
      thumbnailImageUrl: null,
      productOwner: {
        memberId: 1,
        nickname: "이방토",
        name: "이예원",
        schoolName: "한양대 ERICA",
      },
      partQuotas: [
        { part: "DESIGN", currentCount: 1, quota: 1, status: "RECRUITING" },
        { part: "WEB", currentCount: 1, quota: 1, status: "COMPLETED" },
        { part: "SPRINGBOOT", currentCount: 1, quota: 1, status: "COMPLETED" },
      ],
    },
    matchingRound: { id: null, type: "PLAN_DESIGN", phase: "RANDOM_MATCHING" },
    status: "APPROVED",
  },
]

interface MyApplicationRoundSectionProps {
  item: MyProjectApplicationResponse
}

function MyApplicationRoundSection({ item }: MyApplicationRoundSectionProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const roundLabel = toRoundLabel(
    item.matchingRound.type,
    item.matchingRound.phase,
  )
  const status = STATUS_MAP[item.status]
  const pmInfo = toPmInfo(item.project.productOwner)
  const parts = toParts(item.project.partQuotas)

  return (
    <>
      <div className="flex flex-col">
        <ProjectManagementSubTitle title={roundLabel} className="pb-2">
          <StatusChipTag value={status} type="tag" />
        </ProjectManagementSubTitle>
        <div className="flex flex-col gap-4">
          <ApplicationProjectCard
            projectName={item.project.name}
            thumbnailUrl={item.project.thumbnailImageUrl ?? undefined}
            pmInfo={pmInfo}
            parts={parts}
            rightAction={
              <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
                <Popover.Trigger asChild>
                  <MoreVerticalIcon />
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    side="bottom"
                    align="end"
                    sideOffset={10}
                    avoidCollisions={false}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="shadow-drop-neutral-1 border-teal-gray-50 z-[1100] flex w-[9.5rem] flex-col items-start gap-1 rounded-lg border bg-white px-0.5 pt-2.5 pb-0.5"
                  >
                    <span className="text-label-3-semibold text-teal-gray-400 px-4">
                      바로가기
                    </span>
                    <div className="flex w-full flex-col">
                      <DropdownItem
                        label="내 지원서 보기"
                        onClick={() => {
                          setPopoverOpen(false)
                          setDetailOpen(true)
                        }}
                      />
                      <DropdownItem
                        label="기획 보기"
                        onClick={() => setPopoverOpen(false)}
                      />
                      <DropdownItem
                        label="지원 취소"
                        onClick={() => setPopoverOpen(false)}
                        className="text-error-500"
                      />
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            }
          />
        </div>
      </div>

      <Modal.Root open={detailOpen} onOpenChange={setDetailOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content className="shadow-drop-neutral-3 rounded-2xl">
            <Modal.Title className="sr-only">{item.project.name}</Modal.Title>
            <ProjectDetailCard projectId={item.projectId} />
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}

interface MyApplicationViewProps {
  applications?: MyProjectApplicationResponse[]
}

export function MyApplicationView({
  applications = MOCK_DATA,
}: MyApplicationViewProps) {
  return (
    <div className="flex flex-col gap-10">
      {applications.map((item) => (
        <MyApplicationRoundSection key={item.applicationId} item={item} />
      ))}
    </div>
  )
}
