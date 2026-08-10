import { isChapter } from "@/entities/organization/model/chapters"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { useAdminRecruitingRounds } from "../hooks/useAdminRecruitingRounds"
import { RecruitmentQuestionsEditSection } from "./RecruitmentQuestionsEditSection"
import { RecruitmentRoundSettingsEditForm } from "./RecruitmentRoundSettingsEditForm"

interface RecruitmentRoundEditPageProps {
  seasonId: string
  roundId: string
}

function EditNotice({ message }: { message: string }) {
  return (
    <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 w-full items-center justify-center rounded-[12px] border bg-white">
      {message}
    </div>
  )
}

// DRAFT/OPEN 둘 다 설정(기간·트랙·2지망·공고)과 지원 문항(GET/PUT
// .../rounds/{roundId}/form)을 같은 화면에서 고친다. CLOSED는 목록 화면
// 메뉴에서부터 "수정하기" 진입 자체를 막는다.
export function RecruitmentRoundEditPage({
  seasonId,
  roundId,
}: RecruitmentRoundEditPageProps) {
  const { groups, isLoading, isForbidden, isError } = useAdminRecruitingRounds()
  const group = groups.find((g) => g.seasonId === seasonId)
  const round = group?.rounds.find((r) => r.roundId === roundId)
  const chapter =
    group && isChapter(group.chapterName) ? group.chapterName : undefined

  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "recruitment-management", label: "모집 관리" },
          { id: "recruitment-list", label: "모집 목록" },
          { id: "recruitment-edit", label: "모집 공고 수정" },
        ]}
        title="모집 공고 수정"
        description="모집 기간, 대상 트랙, 공고 내용을 수정합니다."
        className="pl-3"
      />
      {isLoading ? (
        <EditNotice message="불러오는 중입니다..." />
      ) : isForbidden ? (
        <EditNotice message="이 화면을 조회할 권한이 없습니다." />
      ) : isError || !group || !round || round.status == null || !chapter ? (
        <EditNotice message="모집 정보를 찾을 수 없습니다." />
      ) : round.status === "CLOSED" ? (
        <EditNotice message="마감된 모집은 수정할 수 없습니다." />
      ) : (
        <div className="flex flex-col gap-6">
          <RecruitmentRoundSettingsEditForm
            seasonId={seasonId}
            roundId={roundId}
            round={round}
          />
          <RecruitmentQuestionsEditSection
            seasonId={seasonId}
            roundId={roundId}
            chapter={chapter}
            school={group.schoolName}
            round={round}
          />
        </div>
      )}
    </div>
  )
}
