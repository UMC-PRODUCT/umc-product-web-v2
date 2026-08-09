import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

import { recruitingKeys } from "../api/queryKeys"
import { getRecruitingApplicationForm } from "../api/recruitingApi"
import {
  RecruitmentCreateStoreProvider,
  useRecruitmentCreateStoreApi,
} from "../model/useRecruitmentCreateStore"
import { RecruitmentQuestionForm } from "./create/RecruitmentQuestionForm"

import type { Chapter } from "@/entities/organization/model/chapters"

import type { RecruitingRound } from "../api/types"

interface RecruitmentQuestionsEditSectionProps {
  seasonId: string
  roundId: string
  chapter: Chapter
  school: string
  round: RecruitingRound
}

// 문항 수정 화면 진입점. 생성 마법사 Step2(RecruitmentQuestionForm)를 edit
// 모드로 재사용하려면 그 컴포넌트가 읽는 RecruitmentCreateStore에 이 Round의
// seasonId/roundId/basicInfo를 먼저 채워 넣어야 한다. DRAFT/OPEN 둘 다 이
// 화면을 쓴다.
export function RecruitmentQuestionsEditSection(
  props: RecruitmentQuestionsEditSectionProps,
) {
  return (
    <RecruitmentCreateStoreProvider>
      <RecruitmentQuestionsEditSectionInner {...props} />
    </RecruitmentCreateStoreProvider>
  )
}

function RecruitmentQuestionsEditSectionInner({
  seasonId,
  roundId,
  chapter,
  school,
  round,
}: RecruitmentQuestionsEditSectionProps) {
  const storeApi = useRecruitmentCreateStoreApi()

  const { data, isLoading, isError } = useQuery({
    queryKey: recruitingKeys.adminFormStructure(seasonId, roundId),
    queryFn: () => getRecruitingApplicationForm(seasonId, roundId),
  })

  // 스토어 세팅 순서가 중요하다: setSeasonId/patchBasicInfo(recruitmentType·
  // roundNo 변경 시)는 부수효과로 roundId를 null로 되돌리므로, 기존 roundId를
  // 세팅하는 setRoundId는 반드시 마지막에 호출해야 한다. 그래야 Step2가 저장 시
  // createRecruitingRound가 아니라 upsertRecruitingApplicationForm으로만 간다.
  useEffect(() => {
    const { setSeasonId, patchBasicInfo, setRoundId } = storeApi.getState()
    setSeasonId(seasonId)
    patchBasicInfo({
      chapter,
      school,
      recruitmentType: round.type,
      roundNo: String(round.roundNo),
    })
    setRoundId(roundId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonId, roundId])

  if (isLoading) {
    return (
      <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-6 flex min-h-50 w-full items-center justify-center rounded-[12px] border bg-white">
        문항을 불러오는 중입니다...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-6 flex min-h-50 w-full items-center justify-center rounded-[12px] border bg-white">
        모집 문항을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </div>
    )
  }

  return (
    <RecruitmentQuestionForm
      mode="edit"
      initialFormStructure={data}
      sectionIndex={5}
    />
  )
}
