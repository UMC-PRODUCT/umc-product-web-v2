import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  getAllChapters,
  getAllGisu,
} from "@/features/challenger/api/organization"

import {
  getAllProjects,
  getChapterStatistics,
  getManagedProjects,
  getProjectApplications,
} from "../api/applicationApi"
import { applicationKeys } from "../api/applicationKeys"
import { summaryToStats, toProjectApplication } from "../model/mappers"

import type {
  ApplicationStats,
  ProjectApplication,
  UniversityCount,
} from "../model/types"

// 활성 기수 ID 조회
export function useActiveGisuId() {
  return useQuery({
    queryKey: ["gisu", "active"],
    queryFn: async () => {
      const res = await getAllGisu()
      const active = res.gisuList.find((g) => g.isActive)
      return active ? Number(active.gisuId) : null
    },
  })
}

// PM 챌린저 뷰용 데이터
export function useChallengerPageData() {
  const gisuQuery = useActiveGisuId()
  const gisuId = gisuQuery.data ?? 0

  const projectsQuery = useQuery({
    queryKey: applicationKeys.managedProjects(gisuId),
    queryFn: () => getManagedProjects(gisuId),
    enabled: gisuId > 0,
  })

  // 프로젝트 목록이 로드되면 각 프로젝트의 지원자 목록도 함께 조회
  const projects = useMemo(
    () => projectsQuery.data?.content ?? [],
    [projectsQuery.data],
  )

  const applicantsQuery = useQuery({
    queryKey: [
      ...applicationKeys.all,
      "managed-applicants",
      gisuId,
      projects.map((p) => p.id),
    ],
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

  // 서버 데이터 -> 프론트 타입으로 변환
  const transformed: ProjectApplication[] = useMemo(
    () =>
      projects.map((p) =>
        toProjectApplication(p, applicantsQuery.data?.get(p.id) ?? []),
      ),
    [projects, applicantsQuery.data],
  )

  // PM 프로젝트 정보 (프로젝트 카드용)
  const projectInfo = useMemo(() => {
    const firstProject = projects[0]
    if (!firstProject) return null
    return {
      projectName: firstProject.name,
      pmName:
        firstProject.productOwner.nickname || firstProject.productOwner.name,
      pmUniversity: firstProject.productOwner.schoolName,
    }
  }, [projects])

  return {
    projects: transformed,
    projectInfo,
    isLoading:
      gisuQuery.isLoading ||
      projectsQuery.isLoading ||
      applicantsQuery.isLoading,
    isError: gisuQuery.isError || projectsQuery.isError,
    error: gisuQuery.error ?? projectsQuery.error ?? applicantsQuery.error,
  }
}

// 챕터 목록 조회 (name -> id 매핑용)
export function useChapters() {
  return useQuery({
    queryKey: applicationKeys.chapters(),
    queryFn: getAllChapters,
  })
}

// applicant 목록에서 학교별 집계 계산 (schoolId 대신 schoolName 사용)
export function computeUniversities(
  applicantsMap: Map<number, { applicant: { schoolName: string } }[]>,
  totalMembers: number,
): UniversityCount[] {
  const uniMap = new Map<string, number>()
  for (const applicants of applicantsMap.values()) {
    for (const a of applicants) {
      const name = a.applicant.schoolName
      uniMap.set(name, (uniMap.get(name) ?? 0) + 1)
    }
  }
  return Array.from(uniMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, applied]) => ({ name, applied, total: totalMembers }))
}

// Admin 뷰용 데이터
export function useAdminPageData(chapterName?: string) {
  const gisuQuery = useActiveGisuId()
  const gisuId = gisuQuery.data ?? 0

  const chaptersQuery = useChapters()
  const chapters = useMemo(
    () => chaptersQuery.data?.chapters ?? [],
    [chaptersQuery.data],
  )

  // 선택된 챕터 이름 -> chapterId 매핑
  const chapterId = useMemo(() => {
    if (!chapterName || chapters.length === 0) return undefined
    const found = chapters.find((c) => c.name === chapterName)
    return found ? Number(found.id) : undefined
  }, [chapterName, chapters])

  // 전체 프로젝트 목록 조회 (지원자 테이블용)
  const projectsQuery = useQuery({
    queryKey: applicationKeys.allProjects(gisuId, chapterId),
    queryFn: () => getAllProjects(gisuId, { chapterId }),
    enabled: gisuId > 0,
  })

  const projects = useMemo(
    () => projectsQuery.data?.content ?? [],
    [projectsQuery.data],
  )

  // 각 프로젝트의 지원자 목록 조회 (테이블 + 학교별 통계용)
  const applicantsQuery = useQuery({
    queryKey: [
      ...applicationKeys.all,
      "admin-applicants",
      gisuId,
      chapterId,
      projects.map((p) => p.id),
    ],
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

  // 지부 통계 조회 (rounds, totalMembers, projectRounds, topProjects)
  const chapterStatsQuery = useQuery({
    queryKey: applicationKeys.chapterStatistics(chapterId ?? 0),
    queryFn: () => getChapterStatistics(chapterId!),
    enabled: !!chapterId,
  })

  // projectId -> name 맵 (summaryToStats에서 프로젝트명 조회용)
  const projectIdToName = useMemo(
    () => new Map(projects.map((p) => [p.id, p.name])),
    [projects],
  )

  // 서버 데이터 -> 프론트 타입 변환 (테이블용)
  const transformed: ProjectApplication[] = useMemo(
    () =>
      projects.map((p) =>
        toProjectApplication(p, applicantsQuery.data?.get(p.id) ?? []),
      ),
    [projects, applicantsQuery.data],
  )

  // 통계: summary 기반 (universities만 applicant schoolName으로 보완)
  const stats: ApplicationStats = useMemo(() => {
    if (!chapterStatsQuery.data) {
      return {
        totalMembers: 0,
        completionRate: 0,
        completedCount: 0,
        pendingCount: 0,
        rounds: [],
        topProjects: [],
        universities: [],
        projectRounds: [],
      }
    }
    const partial = summaryToStats(
      chapterStatsQuery.data.summary,
      projectIdToName,
    )
    const universities = applicantsQuery.data
      ? computeUniversities(applicantsQuery.data, partial.totalMembers)
      : []
    return { ...partial, universities }
  }, [chapterStatsQuery.data, projectIdToName, applicantsQuery.data])

  return {
    projects: transformed,
    stats,
    dataUpdatedAt: applicantsQuery.dataUpdatedAt || projectsQuery.dataUpdatedAt,
    chapters,
    isLoading:
      gisuQuery.isLoading ||
      chaptersQuery.isLoading ||
      projectsQuery.isLoading ||
      applicantsQuery.isLoading ||
      chapterStatsQuery.isLoading,
    isError:
      gisuQuery.isError || chaptersQuery.isError || projectsQuery.isError,
    error: gisuQuery.error ?? chaptersQuery.error ?? projectsQuery.error,
  }
}
