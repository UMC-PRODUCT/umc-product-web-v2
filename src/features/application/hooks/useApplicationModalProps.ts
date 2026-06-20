import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  isCentralCore,
  isChapterPresident,
  isCurrentTermPm,
} from "@/features/auth/model/identity"
import { getProjectDetail } from "@/features/project/list/api/matchingProject"
import { useSchoolChapterMap } from "@/shared/hooks/useSchoolChapterMap"
import { useViewerIdentity } from "@/shared/view-mode/useViewerIdentity"

import { getMatchingRounds } from "../api/applicationApi"
import { applicationKeys } from "../api/applicationKeys"
import { buildDecisionDeadlineByRound } from "../model/matchingDecision"
import { useProjectsPermissions } from "./useProjectsPermissions"

import type { MatchingRoundResponse } from "../model/apiTypes"

function getCurrentRound(rounds: MatchingRoundResponse[]): {
  currentRound: number | undefined
  activeRound: number | undefined
} {
  const now = Date.now()
  const toRound = (phase: string) =>
    phase === "FIRST" ? 1 : phase === "SECOND" ? 2 : 3

  const active = rounds.find(
    (r) =>
      new Date(r.startsAt).getTime() <= now &&
      now <= new Date(r.endsAt).getTime(),
  )
  if (active) {
    const round = toRound(active.phase)
    return { currentRound: round, activeRound: round }
  }

  const completed = [...rounds]
    .filter((r) => new Date(r.endsAt).getTime() < now)
    .sort((a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime())
  const fallback = completed[0] ? toRound(completed[0].phase) : undefined
  return { currentRound: fallback, activeRound: undefined }
}

interface UseApplicationModalPropsOptions {
  enabled?: boolean
}

export function useApplicationModalProps(
  projectId: string | number | undefined,
  options: UseApplicationModalPropsOptions = {},
) {
  const enabled = options.enabled ?? true
  const numericProjectId = projectId ? Number(projectId) : undefined
  const hasValidProjectId =
    numericProjectId !== undefined && numericProjectId > 0

  // 1. 유저 권한 조회 및 UI 표시 제어 변수 도출
  const { me } = useViewerIdentity()
  const isPm = isCurrentTermPm(me)
  const hidePendingStatus = isPm
  const disableFormPanel = !(isCentralCore(me) || isChapterPresident(me))

  // 2. 프로젝트 상세 조회 (chapterId 식별을 위해 schoolName 조회)
  const projectDetailQuery = useQuery({
    queryKey: ["projectDetail", numericProjectId],
    queryFn: () => getProjectDetail(numericProjectId!),
    enabled: enabled && hasValidProjectId,
    staleTime: 5 * 60 * 1000,
  })

  const { getChapterIdBySchool } = useSchoolChapterMap()
  const schoolName = projectDetailQuery.data?.productOwner?.schoolName
  const chapterId = schoolName ? getChapterIdBySchool(schoolName) : undefined

  // 3. 프로젝트 단위 합/불 결정 권한 조회
  const permissions = useProjectsPermissions(
    projectId ? [String(projectId)] : [],
    {
      enabled: enabled && !!projectId,
    },
  )
  const canDecide = projectId ? permissions.canDecide(projectId) : false

  // 4. 매칭 차수 조회
  const roundsQuery = useQuery({
    queryKey: applicationKeys.matchingRounds(chapterId),
    queryFn: () => getMatchingRounds(chapterId),
    enabled: enabled && chapterId !== undefined,
  })

  // 5. 차수별 데드라인 및 현재 라운드 계산
  const decisionDeadlineByRound = useMemo(
    () => buildDecisionDeadlineByRound(roundsQuery.data),
    [roundsQuery.data],
  )

  const { currentRound } = useMemo(
    () => getCurrentRound(roundsQuery.data ?? []),
    [roundsQuery.data],
  )

  const isLoading =
    enabled &&
    (projectDetailQuery.data === undefined ||
      permissions.data === undefined ||
      (chapterId !== undefined && roundsQuery.data === undefined)) &&
    !projectDetailQuery.isError &&
    !permissions.isError &&
    !(chapterId !== undefined && roundsQuery.isError)

  return {
    currentRound,
    decisionDeadlineByRound,
    disableFormPanel,
    hidePendingStatus,
    canDecide,
    isLoading,
  }
}
