import { useMemo, useState } from "react"

import { MOCK_PROJECTS } from "@/features/application/model/applicationMock"
import { useMe } from "@/features/auth/hooks/useMe"
import {
  getViewerBranch,
  isCurrentTermPm,
  isOperator,
} from "@/features/auth/model/identity"
import { MOCK_MATCHING_PROJECTS } from "@/features/project/list/model/matchingProject.mock"
import {
  type Chapter,
  ChapterSelector,
} from "@/shared/ui/segment/ChapterSelector"

import { ProjectManagementCard } from "./ProjectManagementCard"
import { ProjectManagementSubTitle } from "./ProjectManagementSubTitle"

export function ProjectManagementPage() {
  const { data: me } = useMe()
  const isPm = isCurrentTermPm(me)
  const isOp = isOperator(me)
  const canManage = isOp
  const viewerBranch = getViewerBranch(me)

  const [selectedChapter, setSelectedChapter] = useState<Chapter>("Chromium")

  const projects = useMemo(() => {
    if (isPm && viewerBranch) {
      return MOCK_MATCHING_PROJECTS.filter((p) => p.branch === viewerBranch)
    }
    return MOCK_MATCHING_PROJECTS.filter((p) => p.branch === selectedChapter)
  }, [isPm, viewerBranch, selectedChapter])

  const partGroups = useMemo(() => {
    const map = new Map<string, typeof projects>()
    for (const project of projects) {
      for (const row of project.recruitRows) {
        if (!map.has(row.part)) map.set(row.part, [])
        map.get(row.part)!.push(project)
      }
    }
    return map
  }, [projects])

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
          ) : projects.length > 0 ? (
            <div className="flex flex-col gap-3">
              {projects.map((project, i) => (
                <ProjectManagementCard
                  key={project.id}
                  data={project}
                  projectApplication={MOCK_PROJECTS[i % MOCK_PROJECTS.length]!}
                />
              ))}
            </div>
          ) : (
            <p className="text-body-2-medium text-teal-gray-400 py-10 text-center">
              등록된 프로젝트가 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
