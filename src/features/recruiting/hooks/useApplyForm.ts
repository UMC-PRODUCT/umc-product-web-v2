import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useSchoolDetail } from "@/entities/organization/hooks/useSchool"
import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getAllPublicRounds, getFormStructure } from "../api/recruitingApi"
import { toApplicationSections } from "../model/applicationDetailMapper"

import type {
  RecruitingRound,
  RecruitingRoundGroup,
  RecruitingTrack,
} from "../api/types"
import type { ApplyFormConfig } from "../model/applyForm"

interface RoundLocation {
  group: RecruitingRoundGroup
  round: RecruitingRound
}

const BASIC_SECTION_TITLE = "기본 문항"

function normalizeLabel(value: string) {
  return value.replace(/\s+/g, "").toLowerCase()
}

function findBasicQuestionId(
  questions: ApplyFormConfig["sections"][number]["questions"],
  keyword: string,
) {
  return questions.find((question) => question.title.includes(keyword))
    ?.questionId
}

function getPartQuestionIds(
  questions: ApplyFormConfig["sections"][number]["questions"],
) {
  return questions
    .filter(
      (question) =>
        question.title.includes("1지망") || question.title.includes("2지망"),
    )
    .map((question) => question.questionId)
}

function getPartOptionSectionMap(
  sections: ApplyFormConfig["sections"],
  basicQuestions: ApplyFormConfig["sections"][number]["questions"],
) {
  const partSections = sections.filter((section) => section.type === "part")
  const sectionByLabel = new Map(
    partSections.map((section) => [normalizeLabel(section.title), section]),
  )

  return Object.fromEntries(
    basicQuestions
      .filter(
        (question) =>
          question.title.includes("1지망") || question.title.includes("2지망"),
      )
      .flatMap((question) =>
        question.options.flatMap((option) => {
          const section = sectionByLabel.get(normalizeLabel(option.content))
          return section ? [[option.optionId, section.sectionId] as const] : []
        }),
      ),
  )
}

function locateRound(
  groups: RecruitingRoundGroup[],
  roundId: string,
): RoundLocation | null {
  for (const group of groups) {
    const round = group.rounds.find(
      (candidate) => String(candidate.roundId) === roundId,
    )
    if (round) return { group, round }
  }
  return null
}

export function useApplyForm(
  roundId: string,
  firstChoice: RecruitingTrack | undefined,
  secondChoice: RecruitingTrack | undefined,
) {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  const roundQuery = useQuery({
    queryKey: recruitingKeys.round(gisuId ?? "", roundId),
    queryFn: () => getAllPublicRounds(gisuId!, [roundId]),
    enabled: gisuId != null,
    staleTime: 5 * 60 * 1000,
  })

  const location = useMemo(
    () => locateRound(roundQuery.data ?? [], roundId),
    [roundQuery.data, roundId],
  )
  const schoolQuery = useSchoolDetail(location?.group.schoolId)
  const applicationFormId = location?.round.applicationFormId ?? null
  const structureFirstChoice =
    firstChoice ?? location?.round.recruitableTracks[0] ?? null

  // firstChoice 는 required query 다. 지망을 고르기 전에는 구조를 받을 수 없어
  // 모집 차수의 첫 모집 파트를 임시 기준으로 구조를 받아 기본 문항부터 보여준다.
  const structureQuery = useQuery({
    queryKey: recruitingKeys.formStructure(
      applicationFormId ?? "",
      structureFirstChoice ?? "",
      secondChoice ?? null,
    ),
    queryFn: () =>
      getFormStructure(applicationFormId!, {
        firstChoice: structureFirstChoice!,
        secondChoice,
      }),
    enabled: applicationFormId != null && structureFirstChoice != null,
    staleTime: 5 * 60 * 1000,
  })

  const config = useMemo((): ApplyFormConfig | null => {
    const structure = structureQuery.data
    if (!structure || !location || !structureFirstChoice) return null

    const sections = toApplicationSections(structure, [], {
      firstChoice: structureFirstChoice,
      secondChoice: secondChoice ?? null,
    })
    const basicSection = sections.find(
      (section) => section.title === BASIC_SECTION_TITLE,
    )
    const basicQuestions = basicSection?.questions ?? []

    return {
      recruitment: {
        recruitmentId: String(location.round.roundId),
        title: location.round.title,
        school: location.group.schoolName,
        notice: location.round.announcement ?? "",
        logoUrl: schoolQuery.data?.logoImageUrl ?? null,
      },
      // 답변 없이 부르면 빈 폼 구조가 나온다. 문항 정렬·선택지 변환·타입 매핑이
      // 평가 상세와 같아야 하므로 같은 매퍼를 쓴다.
      sections,
      partQuestionIds: getPartQuestionIds(basicQuestions),
      partOptionSectionMap: getPartOptionSectionMap(sections, basicQuestions),
      nameQuestionId: findBasicQuestionId(basicQuestions, "성함"),
    }
  }, [
    schoolQuery.data?.logoImageUrl,
    structureQuery.data,
    location,
    secondChoice,
    structureFirstChoice,
  ])

  return {
    round: location?.round ?? null,
    config,
    isLoading: roundQuery.isLoading || structureQuery.isLoading,
    isStructureFetching: structureQuery.isFetching,
    isError: gisuQuery.isError || roundQuery.isError || structureQuery.isError,
    // 조회는 됐는데 그 차수가 없는 경우. 잘못된 링크로 들어온 것이라
    // "잠시 후 다시 시도"로 안내하면 아무리 기다려도 달라지지 않는다.
    isNotFound: roundQuery.isSuccess && location == null,
  }
}
