import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { MOCK_PROJECTS } from "@/features/application/model/applicationMock"
import { useMe } from "@/features/auth/hooks/useMe"
import { isCurrentTermPm, isOperator } from "@/features/auth/model/identity"
import { MOCK_MATCHING_PROJECTS } from "@/features/project/list/model/matchingProject.mock"
import { gisuKeys } from "@/features/project/new/api/queryKeys"
import { getActiveGisu } from "@/shared/api/gisu"
import {
  type Chapter,
  ChapterSelector,
} from "@/shared/ui/segment/ChapterSelector"

import { getManagedProjects, type ManagedProjectSummaryResponse } from "../api"
import { ProjectManagementCard } from "./ProjectManagementCard"
import { ProjectManagementSubTitle } from "./ProjectManagementSubTitle"

import type { MatchingProject } from "@/features/project/list/model/matchingProject"

function toMatchingProject(
  item: ManagedProjectSummaryResponse,
): MatchingProject {
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
      part: q.part ?? "",
      current: q.currentCount ?? 0,
      total: q.quota ?? 0,
    })),
  }
}

export function ProjectManagementPage() {
  const { data: me } = useMe()
  const isPm = isCurrentTermPm(me)
  const isOp = isOperator(me)
  const canManage = isOp
  const [selectedChapter, setSelectedChapter] = useState<Chapter>("Chromium")

  const gisuQuery = useQuery({
    queryKey: gisuKeys.active,
    queryFn: getActiveGisu,
    enabled: isPm,
  })
  const gisuId = gisuQuery.data?.gisuId
    ? Number(gisuQuery.data.gisuId)
    : undefined

  const managedQuery = useQuery({
    queryKey: ["project", "managed", "me", gisuId],
    queryFn: () => getManagedProjects(gisuId!),
    enabled: isPm && !!gisuId,
  })

  const pmProjects: MatchingProject[] = useMemo(
    () => (managedQuery.data ?? []).map(toMatchingProject),
    [managedQuery.data],
  )

  const opProjects = useMemo(() => {
    return MOCK_MATCHING_PROJECTS.filter((p) => p.branch === selectedChapter)
  }, [selectedChapter])

  const partGroups = useMemo(() => {
    const map = new Map<string, typeof opProjects>()
    for (const project of opProjects) {
      for (const row of project.recruitRows) {
        if (!map.has(row.part)) map.set(row.part, [])
        map.get(row.part)!.push(project)
      }
    }
    return map
  }, [opProjects])

  if (!isOp && !isPm) return null

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

        {canManage && (
          <ChapterSelector
            selectedChapter={selectedChapter}
            onChapterChange={setSelectedChapter}
            className="mt-2.5"
          />
        )}

        <div className="flex flex-col gap-10">
          {canManage ? (
            partGroups.size > 0 ? (
              Array.from(partGroups.entries()).map(([part, partProjects]) => (
                <div key={part} className="flex flex-col">
                  <ProjectManagementSubTitle title={part} className="pb-2" />
                  <div className="flex flex-col gap-4">
                    {partProjects.map((project, i) => (
                      <ProjectManagementCard
                        key={project.id}
                        data={project}
                        projectApplication={
                          MOCK_PROJECTS[i % MOCK_PROJECTS.length]!
                        }
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-body-2-medium text-teal-gray-400 py-10 text-center">
                해당 챕터에 등록된 프로젝트가 없습니다.
              </p>
            )
          ) : isPm ? (
            managedQuery.isLoading ? (
              <p className="text-body-2-regular text-teal-gray-400 py-10 text-center">
                데이터를 불러오는 중...
              </p>
            ) : pmProjects.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pmProjects.map((project, i) => (
                  <ProjectManagementCard
                    key={project.id}
                    data={project}
                    projectApplication={
                      MOCK_PROJECTS[i % MOCK_PROJECTS.length]!
                    }
                  />
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
