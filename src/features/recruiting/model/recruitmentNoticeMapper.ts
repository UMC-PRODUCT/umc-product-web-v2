import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

import { toPartTagsFromTracks } from "./applicantMapper"

import type {
  RecruitingMyApplicationResponse,
  RecruitingRound,
  RecruitingRoundGroup,
} from "../api/types"
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

type AppliedStatus = NonNullable<RecruitmentNoticeItem["appliedStatus"]>

// 취소된 지원서는 지원 이력이 없는 것과 같다. 제출 전이면 이어 쓸 수 있는
// 초안, 제출 후에는 마감 전까지만 수정할 수 있다(editable).
function toApplyConfirmStatus(
  application: RecruitingMyApplicationResponse,
): AppliedStatus | undefined {
  if (application.cancelled) return undefined
  if (!application.submitted) return "draft"
  return application.editable ? "submittedEditable" : "submitted"
}

// roundId 로 조인할 수 있도록 로그인 회원의 지원 내역을 map 으로 바꾼다.
export function toMyApplicationsByRoundId(
  applications: RecruitingMyApplicationResponse[],
): Map<string, AppliedStatus> {
  const map = new Map<string, AppliedStatus>()
  for (const application of applications) {
    if (application.roundId == null) continue
    const status = toApplyConfirmStatus(application)
    if (status) map.set(String(application.roundId), status)
  }
  return map
}

function toNoticeItem(
  group: RecruitingRoundGroup,
  round: RecruitingRound,
  now: dayjs.Dayjs,
  myApplicationsByRoundId: Map<string, AppliedStatus>,
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
    // 비로그인 사용자는 이 목록만으로 지원 상태를 알 수 없어 항상
    // '아직 지원 전'으로 보고 지원 폼으로 보낸다.
    appliedStatus: myApplicationsByRoundId.get(String(round.roundId)),
  }
}

export function toRecruitmentNoticeItems(
  groups: RecruitingRoundGroup[],
  now: Date = new Date(),
  myApplicationsByRoundId: Map<string, AppliedStatus> = new Map(),
): RecruitmentNoticeItem[] {
  const today = dayjs(now)

  return groups
    .flatMap((group) =>
      group.rounds.map((round) =>
        toNoticeItem(group, round, today, myApplicationsByRoundId),
      ),
    )
    .filter((item): item is RecruitmentNoticeItem => item != null)
    .sort((a, b) => {
      // 진행 중을 먼저, 그 안에서는 마감이 임박한 순으로.
      if (a.isClosed !== b.isClosed) return a.isClosed ? 1 : -1
      return dayjs(a.documentEndAt).valueOf() - dayjs(b.documentEndAt).valueOf()
    })
}
