import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

import { toPartTagsFromTracks } from "./applicantMapper"

import type { RecruitingRound, RecruitingRoundGroup } from "../api/types"
import type { RecruitmentNoticeItem } from "./recruitmentNotice"

// utcOffset 을 설정값으로 쓰려면 utc 플러그인이 필요하다.
dayjs.extend(utc)

// 남은 일수는 날짜 경계로 센다. 마감 당일이면 0 이고, 지난 공고는 세지 않는다.
// 모집 일정은 한국 기준이라 브라우저 시간대가 무엇이든 KST 의 날짜로 자른다.
// 로컬 기준으로 자르면 시간대가 다른 환경에서 하루가 어긋난다.
const KST_OFFSET_MINUTES = 9 * 60

function toKstStartOfDay(value: dayjs.Dayjs) {
  return value.utcOffset(KST_OFFSET_MINUTES).startOf("day")
}

function toDDay(documentEndAt: string, now: dayjs.Dayjs): number | undefined {
  const end = dayjs(documentEndAt)
  if (!end.isValid()) return undefined
  const days = toKstStartOfDay(end).diff(toKstStartOfDay(now), "day")
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
    // 차수 id 를 그대로 쓴다. int64 라 number 로 바꾸면 정밀도를 잃을 수 있고,
    // 지원 폼 라우트도 문자열 roundId 를 받는다.
    id: String(round.roundId),
    title: round.title,
    schoolName: group.schoolName,
    parts: toPartTagsFromTracks(round.recruitableTracks),
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
