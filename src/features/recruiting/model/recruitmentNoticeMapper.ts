import dayjs from "dayjs"

import type { PartTag } from "@/shared/model/domain"

import type {
  RecruitingRound,
  RecruitingRoundGroup,
  RecruitingTrack,
} from "../api/types"
import type { RecruitmentNoticeItem } from "./recruitmentNotice"

const TRACK_PART_TAG: Record<RecruitingTrack, PartTag | null> = {
  PLAN: "pm",
  DESIGN: "design",
  WEB_PRODUCT_ENGINEER: "web-pe",
  MOBILE_PRODUCT_ENGINEER: "mobile-pe",
  INFRA_PLUS: null,
}

function toPartTags(tracks: RecruitingTrack[]): PartTag[] {
  const tags = tracks
    .map((track) => TRACK_PART_TAG[track])
    .filter((tag): tag is PartTag => tag != null)
  return [...new Set(tags)]
}

// 남은 일수는 날짜 경계로 센다. 마감 당일이면 0 이고, 지난 공고는 세지 않는다.
function toDDay(documentEndAt: string, now: dayjs.Dayjs): number | undefined {
  const end = dayjs(documentEndAt)
  if (!end.isValid()) return undefined
  const days = end.startOf("day").diff(now.startOf("day"), "day")
  return days >= 0 ? days : undefined
}

function toNoticeItem(
  group: RecruitingRoundGroup,
  round: RecruitingRound,
  now: dayjs.Dayjs,
): RecruitmentNoticeItem | null {
  // 지원 기간이 없는 차수는 지원할 수도, 기간을 표시할 수도 없다.
  if (!round.documentStartAt || !round.documentEndAt) return null

  const isClosed = !round.applicationOpen

  return {
    id: Number(round.roundId),
    roundId: String(round.roundId),
    title: round.title,
    schoolName: group.schoolName,
    parts: toPartTags(round.recruitableTracks),
    documentStartAt: round.documentStartAt,
    documentEndAt: round.documentEndAt,
    isClosed,
    dDay: isClosed ? undefined : toDDay(round.documentEndAt, now),
    announcement: round.announcement ?? "",
    // 로그인 사용자의 지원 상태를 알려주는 응답이 없다. 값을 비워 두면 화면이
    // '아직 지원 전'으로 보고 지원 폼으로 보낸다.
    appliedStatus: undefined,
  }
}

export function toRecruitmentNoticeItems(
  groups: RecruitingRoundGroup[],
  now: Date = new Date(),
): RecruitmentNoticeItem[] {
  const today = dayjs(now)

  return groups
    .flatMap((group) =>
      group.rounds.map((round) => toNoticeItem(group, round, today)),
    )
    .filter((item): item is RecruitmentNoticeItem => item != null)
    .sort((a, b) => {
      // 진행 중을 먼저, 그 안에서는 마감이 임박한 순으로.
      if (a.isClosed !== b.isClosed) return a.isClosed ? 1 : -1
      return dayjs(a.documentEndAt).valueOf() - dayjs(b.documentEndAt).valueOf()
    })
}
