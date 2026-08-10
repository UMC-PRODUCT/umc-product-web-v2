import { describe, expect, it } from "vitest"

import {
  assignApplicant,
  calcAllocationRate,
  formatDateTabLabel,
  parseSlotKey,
  resolveScheduleDates,
  splitApplicantsByAssignment,
  toInterviewScheduleRounds,
  toSlotKey,
  unassignApplicant,
} from "./interviewSchedule"

import type {
  RecruitingRoundGroup,
  RecruitingStatusSummary,
} from "../api/types"
import type { SlotAssignment } from "./interviewSchedule"

function group(rounds: RecruitingRoundGroup["rounds"]): RecruitingRoundGroup {
  return {
    seasonId: "season-1",
    gisuId: "gisu-1",
    chapterId: "chapter-1",
    chapterName: "서울",
    schoolId: "school-1",
    schoolName: "중앙대학교",
    rounds,
  }
}

function round(
  overrides: Partial<RecruitingRoundGroup["rounds"][number]> = {},
) {
  return {
    roundId: "round-1",
    title: "중앙대학교 UMC 11기 모집",
    type: "REGULAR" as const,
    roundNo: 1,
    recruitableTracks: [],
    secondChoiceEnabled: false,
    documentStartAt: null,
    documentEndAt: "2026-07-17T23:59:00Z",
    documentResultPublishedAt: null,
    interviewRequired: true,
    interviewStartAt: "2026-07-18T01:00:00Z",
    interviewEndAt: "2026-07-26T14:59:00Z",
    finalResultPublishedAt: null,
    announcement: null,
    ...overrides,
  }
}

const statusSummary: RecruitingStatusSummary = {
  totalCount: 1,
  countByStatus: {},
  parts: [],
  schools: [
    {
      schoolId: "school-1",
      schoolName: "중앙대학교",
      chapterId: "chapter-1",
      chapterName: "서울",
      totalCount: 12,
      countByStatus: {},
      parts: [],
      rounds: [
        {
          roundId: "round-1",
          roundTitle: "중앙대학교 UMC 11기 모집",
          roundType: "REGULAR",
          roundNo: 1,
          totalCount: 12,
          countByStatus: { INTERVIEW_ASSIGNED: 5 },
          parts: [],
        },
      ],
    },
  ],
}

describe("toInterviewScheduleRounds", () => {
  it("서버 차수와 서버 집계로 면접 스케줄 목록을 만든다", () => {
    expect(
      toInterviewScheduleRounds([group([round()])], statusSummary),
    ).toEqual([
      expect.objectContaining({
        roundId: "round-1",
        schoolName: "중앙대학교",
        roundTitle: "중앙대학교 UMC 11기 모집",
        assignedCount: 5,
        totalCount: 12,
      }),
    ])
  })

  it("DRAFT이거나 면접 일정이 없는 차수는 제외한다", () => {
    expect(
      toInterviewScheduleRounds([
        group([
          round({ status: "DRAFT" }),
          round({ roundId: "round-2", interviewRequired: false }),
          round({ roundId: "round-3", interviewStartAt: null }),
        ]),
      ]),
    ).toEqual([])
  })
})

describe("resolveScheduleDates", () => {
  it("면접 기간을 하루 단위로 펼친다", () => {
    expect(
      resolveScheduleDates("2026-07-18T10:00:00", "2026-07-21T18:00:00"),
    ).toEqual(["2026-07-18", "2026-07-19", "2026-07-20", "2026-07-21"])
  })

  it("같은 날이면 하루만 만든다", () => {
    expect(
      resolveScheduleDates("2026-07-18T10:00:00", "2026-07-18T23:00:00"),
    ).toEqual(["2026-07-18"])
  })

  it("기간이 없거나 뒤집혀 있으면 비운다", () => {
    expect(resolveScheduleDates(undefined, undefined)).toEqual([])
    expect(
      resolveScheduleDates("2026-07-20T00:00:00", "2026-07-18T00:00:00"),
    ).toEqual([])
  })
})

describe("formatDateTabLabel", () => {
  it("앞의 0을 떼고 표기한다", () => {
    expect(formatDateTabLabel("2026-07-08")).toBe("7월 8일")
    expect(formatDateTabLabel("2026-11-26")).toBe("11월 26일")
  })
})

describe("slotKey", () => {
  it("세션 id 에 구분자가 들어 있어도 되돌린다", () => {
    const key = toSlotKey("session__a", "10:30")
    expect(parseSlotKey(key)).toEqual({
      sessionId: "session__a",
      slotStart: "10:30",
    })
  })

  it("슬롯 키가 아니면 null 이다", () => {
    expect(parseSlotKey("applicant-1")).toBeNull()
  })
})

describe("assignApplicant", () => {
  const base: SlotAssignment[] = [
    { sessionId: "a", slotStart: "10:00", applicantId: "u1" },
  ]

  it("빈 슬롯에 배정한다", () => {
    expect(assignApplicant(base, "a", "10:30", "u2")).toEqual([
      { sessionId: "a", slotStart: "10:00", applicantId: "u1" },
      { sessionId: "a", slotStart: "10:30", applicantId: "u2" },
    ])
  })

  it("한 지원자가 두 슬롯을 차지하지 않는다", () => {
    const moved = assignApplicant(base, "a", "11:00", "u1")
    expect(moved).toEqual([
      { sessionId: "a", slotStart: "11:00", applicantId: "u1" },
    ])
  })

  it("이미 찬 슬롯에 넣으면 앞사람을 밀어낸다", () => {
    const replaced = assignApplicant(base, "a", "10:00", "u2")
    expect(replaced).toEqual([
      { sessionId: "a", slotStart: "10:00", applicantId: "u2" },
    ])
  })

  it("다른 면접방의 같은 시각은 별개다", () => {
    const assigned = assignApplicant(base, "b", "10:00", "u2")
    expect(assigned).toHaveLength(2)
  })
})

describe("unassignApplicant", () => {
  it("배정을 걷어낸다", () => {
    const assignments: SlotAssignment[] = [
      { sessionId: "a", slotStart: "10:00", applicantId: "u1" },
      { sessionId: "a", slotStart: "10:30", applicantId: "u2" },
    ]
    expect(unassignApplicant(assignments, "u1")).toEqual([
      { sessionId: "a", slotStart: "10:30", applicantId: "u2" },
    ])
  })
})

describe("splitApplicantsByAssignment", () => {
  it("배정 대기와 배정 완료로 가른다", () => {
    const applicants = [
      { id: "u1", name: "이예원", availabilities: [] },
      { id: "u2", name: "황지원", availabilities: [] },
    ]
    const result = splitApplicantsByAssignment(applicants, [
      { sessionId: "a", slotStart: "10:00", applicantId: "u2" },
    ])
    expect(result.waiting.map((a) => a.id)).toEqual(["u1"])
    expect(result.assigned.map((a) => a.id)).toEqual(["u2"])
  })
})

describe("calcAllocationRate", () => {
  it("배정률을 반올림해 낸다", () => {
    expect(calcAllocationRate(26, 42)).toBe(62)
  })

  it("대상이 없으면 0 이다", () => {
    expect(calcAllocationRate(0, 0)).toBe(0)
  })
})
