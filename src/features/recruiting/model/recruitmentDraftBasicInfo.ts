import { isChapter } from "@/entities/organization/model/chapters"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"

import {
  buildRecruitmentPreviewTitle,
  INITIAL_PERIOD_FORM,
  type PeriodFieldKey,
  type PeriodFieldValue,
} from "./recruitmentCreate"

import type { RecruitingRound, RecruitingRoundGroup } from "../api/types"
import type { RecruitmentBasicInfo } from "./useRecruitmentCreateStore"

export interface RecruitmentDraftBasicInfo {
  roundId: string
  seasonId: string
  basicInfo: RecruitmentBasicInfo
  announcement: string
  contactText: string
}

function toPeriodField(
  value: string | null | undefined,
  fallback: PeriodFieldValue,
): PeriodFieldValue {
  if (!value) return fallback

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return fallback

  const pad = (part: number) => String(part).padStart(2, "0")
  return {
    date: `${parsed.getUTCFullYear()}-${pad(parsed.getUTCMonth() + 1)}-${pad(parsed.getUTCDate())}`,
    time: `${pad(parsed.getUTCHours())}:${pad(parsed.getUTCMinutes())}`,
  }
}

function toPeriodForm(
  round: RecruitingRound,
): Record<PeriodFieldKey, PeriodFieldValue> {
  return {
    documentStartAt: toPeriodField(
      round.documentStartAt,
      INITIAL_PERIOD_FORM.documentStartAt,
    ),
    documentEndAt: toPeriodField(
      round.documentEndAt,
      INITIAL_PERIOD_FORM.documentEndAt,
    ),
    documentResultPublishedAt: toPeriodField(
      round.documentResultPublishedAt,
      INITIAL_PERIOD_FORM.documentResultPublishedAt,
    ),
    interviewStartAt: toPeriodField(
      round.interviewStartAt,
      INITIAL_PERIOD_FORM.interviewStartAt,
    ),
    interviewEndAt: toPeriodField(
      round.interviewEndAt,
      INITIAL_PERIOD_FORM.interviewEndAt,
    ),
    finalResultPublishedAt: toPeriodField(
      round.finalResultPublishedAt,
      INITIAL_PERIOD_FORM.finalResultPublishedAt,
    ),
  }
}

// 저장할 때 제목은 "<학교> <기수> <차수> <꼬리말>" 로 조립된다. 되돌릴 때 같은
// 규칙으로 앞부분을 떼어내야 꼬리말 칸에 접두사가 중복으로 쌓이지 않는다.
function extractFooter(
  round: RecruitingRound,
  school: string | undefined,
  gisuGeneration: number | null | undefined,
): string {
  const prefix = `${buildRecruitmentPreviewTitle({
    school,
    recruitmentType: round.type,
    roundNo: String(round.roundNo),
    gisuGeneration,
  })} `
  return round.title.startsWith(prefix)
    ? round.title.slice(prefix.length).trim()
    : ""
}

export function mapRoundToDraftBasicInfo(
  group: RecruitingRoundGroup,
  round: RecruitingRound,
  gisuGeneration: number | null | undefined,
): RecruitmentDraftBasicInfo {
  const school = formatSchoolName(group.schoolName)

  return {
    roundId: round.roundId,
    seasonId: group.seasonId,
    basicInfo: {
      chapter: isChapter(group.chapterName) ? group.chapterName : undefined,
      school,
      recruitmentType: round.type,
      roundNo: String(round.roundNo),
      interviewRequired: round.interviewRequired,
      footer: extractFooter(round, school, gisuGeneration),
      periodForm: toPeriodForm(round),
    },
    announcement: round.announcement ?? "",
    contactText: round.contactText ?? "",
  }
}
