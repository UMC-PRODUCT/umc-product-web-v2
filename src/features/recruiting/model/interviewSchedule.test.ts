import { describe, expect, it } from "vitest"

import {
  assignApplicant,
  buildTimeSlots,
  calcAllocationRate,
  formatDateTabLabel,
  isSessionComplete,
  parseSlotKey,
  resolveScheduleDates,
  splitApplicantsByAssignment,
  toSlotKey,
  unassignApplicant,
} from "./interviewSchedule"

import type { InterviewSession, SlotAssignment } from "./interviewSchedule"

describe("buildTimeSlots", () => {
  it("30분 단위로 시간대를 쪼갠다", () => {
    expect(buildTimeSlots("10:00", "11:30")).toEqual([
      { start: "10:00", end: "10:30" },
      { start: "10:30", end: "11:00" },
      { start: "11:00", end: "11:30" },
    ])
  })

  it("30분을 채우지 못하는 끝자락은 버린다", () => {
    expect(buildTimeSlots("10:00", "11:10")).toEqual([
      { start: "10:00", end: "10:30" },
      { start: "10:30", end: "11:00" },
    ])
  })

  it("끝시각이 시작시각보다 빠르면 만들지 않는다", () => {
    expect(buildTimeSlots("14:00", "13:00")).toEqual([])
    expect(buildTimeSlots("14:00", "14:00")).toEqual([])
  })

  it("형식이 어긋난 시각은 만들지 않는다", () => {
    expect(buildTimeSlots("9시", "11:00")).toEqual([])
    expect(buildTimeSlots("25:00", "26:00")).toEqual([])
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

describe("isSessionComplete", () => {
  const complete: InterviewSession = {
    id: "s1",
    name: "디자인 파트 면접",
    startTime: "15:00",
    endTime: "20:00",
    mode: "online",
    place: "https://meet.example.com/abc",
  }

  it("모두 채우면 완성이다", () => {
    expect(isSessionComplete(complete)).toBe(true)
  })

  it("끝시각이 시작시각보다 빠르면 완성이 아니다", () => {
    expect(isSessionComplete({ ...complete, endTime: "14:00" })).toBe(false)
  })

  it("이름이나 장소가 비면 완성이 아니다", () => {
    expect(isSessionComplete({ ...complete, name: "  " })).toBe(false)
    expect(isSessionComplete({ ...complete, place: "" })).toBe(false)
  })
})
