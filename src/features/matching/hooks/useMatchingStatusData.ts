import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  getAllProjects,
  getManagedProjects,
  getProjectApplications,
} from "@/features/application/api/applicationApi"
import { applicationKeys } from "@/features/application/api/applicationKeys"
import {
  computeAdminStats,
  useActiveGisuId,
  useChapters,
} from "@/features/application/hooks/useApplicationPageData"
import { toProjectApplication } from "@/features/application/model/mappers"
import { useViewModeStore } from "@/shared/view-mode"

import { toMatchingPartDataList } from "../model/matchingStatusMapper"

export function useMatchingStatusData(chapterName?: string) {
  const mode = useViewModeStore((s) => s.mode)
  const isAdmin = mode === "admin"

  const gisuQuery = useActiveGisuId()
  const gisuId = gisuQuery.data ?? 0

  const chaptersQuery = useChapters()
  const chapters = useMemo(
    () => chaptersQuery.data?.chapters ?? [],
    [chaptersQuery.data],
  )

  // admin만 챕터 필터링
  const chapterId = useMemo(() => {
    if (!isAdmin || !chapterName || chapters.length === 0) return undefined
    const found = chapters.find((c) => c.name === chapterName)
    return found ? Number(found.id) : undefined
  }, [isAdmin, chapterName, chapters])

  // admin: 전체 프로젝트 / pm,others: 내 프로젝트
  const projectsQuery = useQuery({
    queryKey: applicationKeys.matchingParts(gisuId, chapterId),
    queryFn: () =>
      isAdmin
        ? getAllProjects(gisuId, { chapterId })
        : getManagedProjects(gisuId),
    enabled: gisuId > 0,
  })

  const projects = useMemo(
    () => projectsQuery.data?.content ?? [],
    [projectsQuery.data],
  )

  // 프로젝트별 지원자 일괄 조회
  const applicantsQuery = useQuery({
    queryKey: applicationKeys.matchingApplicants(
      gisuId,
      chapterId,
      projects.map((p) => p.id),
    ),
    queryFn: async () => {
      const results = await Promise.all(
        projects.map(async (p) => {
          const applicants = await getProjectApplications(p.id)
          return { projectId: p.id, applicants }
        }),
      )
      return new Map(results.map((r) => [r.projectId, r.applicants]))
    },
    enabled: projects.length > 0,
  })

  // 매칭 현황 데이터 변환
  const matchingParts = useMemo(
    () => toMatchingPartDataList(projects, applicantsQuery.data ?? new Map()),
    [projects, applicantsQuery.data],
  )

  // 통계 계산 (기존 로직 재사용)
  const transformed = useMemo(
    () =>
      projects.map((p) =>
        toProjectApplication(p, applicantsQuery.data?.get(p.id) ?? []),
      ),
    [projects, applicantsQuery.data],
  )
  const stats = useMemo(() => computeAdminStats(transformed), [transformed])

  return {
    matchingParts,
    stats,
    dataUpdatedAt: applicantsQuery.dataUpdatedAt || projectsQuery.dataUpdatedAt,
    isAdmin,
    isLoading:
      gisuQuery.isLoading ||
      chaptersQuery.isLoading ||
      projectsQuery.isLoading ||
      applicantsQuery.isLoading,
    isError:
      gisuQuery.isError || chaptersQuery.isError || projectsQuery.isError,
    error:
      gisuQuery.error ??
      chaptersQuery.error ??
      projectsQuery.error ??
      applicantsQuery.error,
  }
}
