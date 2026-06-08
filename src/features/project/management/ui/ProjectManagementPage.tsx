import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { getAllProjects } from "@/features/application/api/applicationApi"
import { useMe } from "@/features/auth/hooks/useMe"
import {
  getViewerBranch,
  isCentralStaff,
  isChapterPresident,
  isCurrentTermPm,
  isSchoolStaff,
  isSuperAdmin,
} from "@/features/auth/model/identity"
import { getAllChapters } from "@/features/challenger/api/organization"
import { gisuKeys } from "@/features/project/new/api/queryKeys"
import { getActiveGisu } from "@/shared/api/gisu"
import {
  type Chapter,
  ChapterSelector,
} from "@/shared/ui/segment/ChapterSelector"

import { getManagedProjects } from "../api"
import { ProjectManagementCard } from "./ProjectManagementCard"
import { ProjectManagementSubTitle } from "./ProjectManagementSubTitle"

import type { MatchingProject } from "@/features/project/list/model/matchingProject"

const FE_PART_LABELS = new Set(["Web", "iOS", "Android"])

const PART_LABEL: Record<string, string> = {
  WEB: "Web",
  IOS: "iOS",
  ANDROID: "Android",
  DESIGN: "Design",
  SPRINGBOOT: "SpringBoot",
  NODEJS: "Node.js",
  PLAN: "기획",
  ADMIN: "운영",
}

type ProjectSummaryInput = {
  id?: number | null
  name?: string | null
  description?: string | null
  thumbnailImageUrl?: string | null
  productOwner?: {
    nickname?: string | null
    name?: string | null
    schoolName?: string | null
  } | null
  partQuotas?:
    | {
        part?: string | null
        currentCount?: number | null
        quota?: number | null
      }[]
    | null
}

function toMatchingProject(item: ProjectSummaryInput): MatchingProject {
  const owner = item.productOwner
  const ownerLine = [
    owner?.nickname && owner?.name
      ? `${owner.nickname}/${owner.name}`
      : (owner?.name ?? ""),
    owner?.schoolName,
  ]
    .filter(Boolean)
    .join(" · ")

  return {
    id: String(item.id ?? ""),
    branch: "",
    school: owner?.schoolName ?? "",
    title: item.name ?? "",
    description: item.description ?? "",
    authorSchoolLine: ownerLine,
    coverImage: item.thumbnailImageUrl ? { src: item.thumbnailImageUrl } : null,
    recruitRows: (item.partQuotas ?? []).map((q) => ({
      part: PART_LABEL[q.part ?? ""] ?? q.part ?? "",
      current: q.currentCount ?? 0,
      total: q.quota ?? 0,
    })),
  }
}

export function ProjectManagementPage() {
  const { data: me } = useMe()

  const isCentral = isSuperAdmin(me) || isCentralStaff(me)
  const isChapPres = isChapterPresident(me)
  const isSchoolAdmin = isSchoolStaff(me)
  const isPm = isCurrentTermPm(me)

  const isAdminScope = isCentral || isChapPres || isSchoolAdmin
  const hasAccess = isAdminScope || isPm

  const [selectedChapter, setSelectedChapter] = useState<Chapter>("Chromium")

  const gisuQuery = useQuery({
    queryKey: gisuKeys.active,
    queryFn: getActiveGisu,
    enabled: hasAccess,
  })
  const gisuId = gisuQuery.data?.gisuId
    ? Number(gisuQuery.data.gisuId)
    : undefined

  // 중앙/지부장: 챕터명 → chapterId 매핑
  const chaptersQuery = useQuery({
    queryKey: ["chapters", "all"],
    queryFn: getAllChapters,
    enabled: isCentral || isChapPres,
  })

  const userChapterName = getViewerBranch(me)
  const effectiveChapterName = isCentral ? selectedChapter : userChapterName

  const effectiveChapterId = useMemo(() => {
    if (!chaptersQuery.data || isSchoolAdmin) return undefined
    return (
      chaptersQuery.data.chapters.find((c) => c.name === effectiveChapterName)
        ?.id ?? undefined
    )
  }, [chaptersQuery.data, effectiveChapterName, isSchoolAdmin])

  // 어드민 프로젝트 쿼리 (중앙/지부장/학교 회장단)
  const adminProjectsQuery = useQuery({
    queryKey: ["projects", "admin", gisuId, effectiveChapterId],
    queryFn: () =>
      getAllProjects(gisuId!, {
        chapterId: effectiveChapterId ? Number(effectiveChapterId) : undefined,
        size: 200,
      }),
    enabled: isAdminScope && !!gisuId,
  })

  // PM 프로젝트 쿼리
  const managedQuery = useQuery({
    queryKey: ["project", "managed", "me", gisuId],
    queryFn: () => getManagedProjects(gisuId!),
    enabled: isPm && !isAdminScope && !!gisuId,
  })

  const adminProjects: MatchingProject[] = useMemo(
    () => (adminProjectsQuery.data?.content ?? []).map(toMatchingProject),
    [adminProjectsQuery.data],
  )

  const pmProjects: MatchingProject[] = useMemo(
    () => (managedQuery.data ?? []).map(toMatchingProject),
    [managedQuery.data],
  )

  const partGroups = useMemo(() => {
    const map = new Map<string, MatchingProject[]>()
    for (const project of adminProjects) {
      for (const row of project.recruitRows) {
        if (!FE_PART_LABELS.has(row.part)) continue
        if (!map.has(row.part)) map.set(row.part, [])
        map.get(row.part)!.push(project)
      }
    }
    return map
  }, [adminProjects])

  if (!hasAccess) return null

  return (
    <section className="relative flex w-full flex-col items-start justify-start pt-8">
      <div className="border-teal-gray-150 relative z-30 flex h-full min-w-242 flex-col gap-6 rounded-xl border bg-white px-8.5 py-8">
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-heading-6-semibold text-teal-gray-900">
            프로젝트 관리
          </span>
          <span className="text-body-2-regular text-teal-gray-600">
            모든 프로젝트의 상세 정보를 확인하고 수정할 수 있습니다.
            <br />
            단, 매칭 중에는 일부 수정이 제한됩니다.
          </span>
        </div>

        {isCentral && (
          <ChapterSelector
            selectedChapter={selectedChapter}
            onChapterChange={setSelectedChapter}
            className="mt-2.5"
          />
        )}

        <div className="flex flex-col gap-10">
          {isAdminScope ? (
            adminProjectsQuery.isLoading ? (
              <p className="text-body-2-regular text-teal-gray-400 py-10 text-center">
                데이터를 불러오는 중...
              </p>
            ) : partGroups.size > 0 ? (
              Array.from(partGroups.entries()).map(([part, partProjects]) => (
                <div key={part} className="flex flex-col">
                  <ProjectManagementSubTitle title={part} className="pb-2" />
                  <div className="flex flex-col gap-4">
                    {partProjects.map((project) => (
                      <ProjectManagementCard key={project.id} data={project} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-body-2-medium text-teal-gray-400 py-10 text-center">
                등록된 프로젝트가 없습니다.
              </p>
            )
          ) : isPm ? (
            managedQuery.isLoading ? (
              <p className="text-body-2-regular text-teal-gray-400 py-10 text-center">
                데이터를 불러오는 중...
              </p>
            ) : pmProjects.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pmProjects.map((project) => (
                  <ProjectManagementCard key={project.id} data={project} />
                ))}
              </div>
            ) : (
              <p className="text-body-2-medium text-teal-gray-400 py-10 text-center">
                등록된 프로젝트가 없습니다.
              </p>
            )
          ) : null}
        </div>
      </div>
    </section>
  )
}
