// import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

// import { useActiveGisuId } from "@/features/application/hooks/useApplicationPageData"
import {
  // getMyApplications,
  type MyProjectApplicationResponse,
} from "@/features/project/list/api/matchingProject"
import { ProjectDetailCard } from "@/features/project/list/ui/ProjectDetailCard"
import { ProjectManagementSubTitle } from "@/features/project/management/ui/ProjectManagementSubTitle"
import { StatusChipTag } from "@/shared/ui/chip/StatusChipTag"
import { Modal } from "@/shared/ui/Modal"

import { ApplicationProjectCard } from "./ApplicationProjectCard"
import { MyApplicationMoreMenu } from "./MyApplicationMoreMenu"

import type { StatusValue } from "../model/types"
import type { ApplicationProjectCardPart } from "./ApplicationProjectCard"

const PART_LABEL: Record<string, string> = {
  PLAN: "기획",
  DESIGN: "Design",
  WEB: "Web",
  IOS: "iOS",
  ANDROID: "Android",
  SPRINGBOOT: "SpringBoot",
  NODEJS: "Node.js",
}
const PART_ORDER = Object.keys(PART_LABEL)

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
  return [...partQuotas]
    .sort((a, b) => {
      const ai = PART_ORDER.indexOf(a.part ?? "")
      const bi = PART_ORDER.indexOf(b.part ?? "")
      return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
    })
    .map((q) => ({
      label: PART_LABEL[q.part] ?? q.part,
      current: q.currentCount,
      total: q.quota,
      done: q.status === "COMPLETED",
    }))
}

interface MyApplicationRoundSectionProps {
  item: MyProjectApplicationResponse
}

function MyApplicationRoundSection({ item }: MyApplicationRoundSectionProps) {
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
            onClick={() => setDetailOpen(true)}
            rightAction={<MyApplicationMoreMenu item={item} />}
          />
        </div>
      </div>

      {/* 프로젝트 상세 (카드 클릭) */}
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

export function MyApplicationView() {
  // TODO: API 연동 시 아래 주석 해제 후 MOCK_DATA 제거
  // const { data: gisuId } = useActiveGisuId()
  // const { data: applications, isLoading } = useQuery({
  //   queryKey: ["myApplications", gisuId],
  //   queryFn: () => getMyApplications(gisuId!),
  //   enabled: gisuId != null,
  // })

  const applications = MOCK_DATA

  return (
    <div className="flex flex-col gap-10">
      {applications.map((item) => (
        <MyApplicationRoundSection key={item.applicationId} item={item} />
      ))}
    </div>
  )
}
