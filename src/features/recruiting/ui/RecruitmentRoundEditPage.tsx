import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { useAdminRecruitingRounds } from "../hooks/useAdminRecruitingRounds"
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

// OPEN 상태 차수의 설정(기간·트랙·2지망·공고)만 고치는 화면. DRAFT는 아직 생성
// 마법사 재사용 편집이 없고(Step2 문항 프리필 미구현), CLOSED는 목록 화면
// 메뉴에서부터 "수정하기" 진입 자체를 막는다.
export function RecruitmentRoundEditPage({
  seasonId,
  roundId,
}: RecruitmentRoundEditPageProps) {
  const { groups, isLoading, isForbidden, isError } = useAdminRecruitingRounds()
  const group = groups.find((g) => g.seasonId === seasonId)
  const round = group?.rounds.find((r) => r.roundId === roundId)

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
      ) : isError || !group || !round || round.status == null ? (
        <EditNotice message="모집 정보를 찾을 수 없습니다." />
      ) : round.status === "DRAFT" ? (
        <EditNotice message="아직 공개되지 않은 모집은 모집 목록의 공유 보관함에서 수정해 주세요." />
      ) : round.status === "CLOSED" ? (
        <EditNotice message="마감된 모집은 수정할 수 없습니다." />
      ) : (
        <RecruitmentRoundSettingsEditForm
          seasonId={seasonId}
          roundId={roundId}
          round={round}
        />
      )}
    </div>
  )
}
