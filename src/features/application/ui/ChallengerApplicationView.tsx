import { cn } from "@/shared/lib/utils"

import { ApplicationTableSection } from "./ApplicationTableSection"
import { ChallengerStatsSection } from "./ChallengerStatsSection"

import type { ChallengerStats } from "../model/challengerMock"
import type { ProjectApplication } from "../model/types"

interface ChallengerApplicationViewProps {
  stats: ChallengerStats
  projects: ProjectApplication[]
  className?: string
}

export function ChallengerApplicationView({
  stats,
  projects,
  className,
}: ChallengerApplicationViewProps) {
  return (
    <div className={cn("flex flex-col gap-[57px] pl-4", className)}>
      <ChallengerStatsSection stats={stats} />
      {/* TODO: API 연동 시 현재 활성 차수를 서버에서 받아오도록 변경 */}
      <ApplicationTableSection
        projects={projects}
        searchPlaceholder="닉네임/이름으로 검색하세요."
        visibleFilters={["round", "part", "school", "appStatus"]}
        currentRound={2}
      />
    </div>
  )
}
