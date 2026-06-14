import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { useActiveGisuId } from "@/features/application/hooks/useApplicationPageData"
import {
  getMyApplications,
  type MyProjectApplicationResponse,
} from "@/features/project/list/api/matchingProject"
import { ProjectDetailCard } from "@/features/project/list/ui/ProjectDetailCard"
import { ProjectManagementSubTitle } from "@/features/project/management/ui/ProjectManagementSubTitle"
import { UsabilitySurvey } from "@/features/usability-survey"
import { StatusChipTag } from "@/shared/ui/chip/StatusChipTag"
import { EmptyState } from "@/shared/ui/EmptyState"
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
  PLAN_DEVELOPER: "Plan-Developer",
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
  const phaseLabel = PHASE_LABEL[phase] ?? phase
  if (!type) return phaseLabel
  const typeLabel = ROUND_TYPE_LABEL[type] ?? type
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

  const isRandomMatching = item.matchingRound.phase === "RANDOM_MATCHING"
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
          {!isRandomMatching && <StatusChipTag value={status} type="tag" />}
        </ProjectManagementSubTitle>
        <div className="flex flex-col gap-4">
          <ApplicationProjectCard
            projectName={item.project.name}
            thumbnailUrl={item.project.thumbnailImageUrl ?? undefined}
            pmInfo={pmInfo}
            parts={parts}
            onClick={() => setDetailOpen(true)}
            rightAction={
              <MyApplicationMoreMenu
                item={item}
                isRandomMatching={isRandomMatching}
              />
            }
          />
        </div>
      </div>

      {/* 프로젝트 상세 (카드 클릭) */}
      <Modal.Root open={detailOpen} onOpenChange={setDetailOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content className="shadow-drop-neutral-3 rounded-2xl">
            <Modal.Title className="sr-only">{item.project.name}</Modal.Title>
            <ProjectDetailCard
              projectId={item.projectId}
              hideMyApplication={isRandomMatching}
            />
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}

export function MyApplicationView() {
  const navigate = useNavigate()
  const { data: gisuId } = useActiveGisuId()
  const { data: raw = [] } = useQuery({
    queryKey: ["myApplications", gisuId],
    queryFn: () => getMyApplications(gisuId!),
    enabled: gisuId != null,
  })
  const applications = raw.filter((a) => a.status !== "CANCELLED")
  const hasMatchingResult = applications.some(
    (a) => a.status === "APPROVED" || a.status === "REJECTED",
  )

  if (!applications?.length) {
    return (
      <EmptyState
        message="지원한 프로젝트가 없습니다."
        subMessage="프로젝트 지원 후 확인할 수 있습니다."
        button={{
          label: "프로젝트 목록으로",
          onClick: () => navigate({ to: "/matching/projects" }),
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {applications.map((item) => (
        <MyApplicationRoundSection key={item.applicationId} item={item} />
      ))}

      <UsabilitySurvey
        context="MATCHING_COMPLETED"
        active={hasMatchingResult}
      />
    </div>
  )
}
