import { describe, expect, it } from "vitest"

import {
  buildAssignmentPayload,
  isValidSlotDuration,
  toApplicantAvailabilities,
  toAssignmentsFromBoard,
  toEditableSession,
  toInstant,
  toKstDateKey,
  toKstTimeLabel,
  toSessionRequest,
} from "./interviewScheduleMapper"

import type { RecruitingBoardSession } from "../api/types"
import type { SlotAssignment } from "./interviewSchedule"

describe("KST 변환", () => {
  // 서버는 UTC 로 주고 운영진은 한국 시간으로 본다. 오프셋을 빼먹으면 날짜 탭이
  // 하루씩 밀린다.
  it("UTC 를 KST 날짜와 시각으로 옮긴다", () => {
    expect(toKstDateKey("2026-08-04T01:00:00Z")).toBe("2026-08-04")
    expect(toKstTimeLabel("2026-08-04T01:00:00Z")).toBe("10:00")
  })

  it("자정을 넘기는 UTC 는 다음 날 KST 가 된다", () => {
    expect(toKstDateKey("2026-08-03T15:30:00Z")).toBe("2026-08-04")
    expect(toKstTimeLabel("2026-08-03T15:30:00Z")).toBe("00:30")
  })

  it("날짜와 시각을 합쳐 UTC 로 되돌린다", () => {
    expect(toInstant("2026-08-04", "10:00")).toBe("2026-08-04T01:00:00.000Z")
  })

  it("왕복해도 같은 값이 된다", () => {
    const instant = "2026-08-04T01:00:00.000Z"
    const roundTrip = toInstant(toKstDateKey(instant), toKstTimeLabel(instant))

    expect(roundTrip).toBe(instant)
  })

  it("형식이 어긋나면 만들지 않는다", () => {
    expect(toInstant("2026-8-4", "10:00")).toBeNull()
    expect(toInstant("2026-08-04", "10시")).toBeNull()
    expect(toInstant("", "")).toBeNull()
  })

  // 모양만 맞는 값을 dayjs 가 다음 달·다음 날로 올려 버리면 잘못된 입력이
  // 엉뚱한 시각으로 저장된다.
  it("달력에 없는 날짜와 범위 밖 시각은 만들지 않는다", () => {
    expect(toInstant("2026-02-31", "10:00")).toBeNull()
    expect(toInstant("2026-13-01", "10:00")).toBeNull()
    expect(toInstant("2026-08-04", "25:00")).toBeNull()
    expect(toInstant("2026-08-04", "10:99")).toBeNull()
  })

  it("윤년 2월 29일은 허용한다", () => {
    expect(toInstant("2028-02-29", "10:00")).toBe("2028-02-29T01:00:00.000Z")
    expect(toInstant("2026-02-29", "10:00")).toBeNull()
  })
})

describe("isValidSlotDuration", () => {
  // 서버가 15 의 양의 배수만 받는다. 화면에서 막지 않으면 저장이 통째로 거부된다.
  it("15 의 양의 배수만 통과시킨다", () => {
    expect(isValidSlotDuration(15)).toBe(true)
    expect(isValidSlotDuration(30)).toBe(true)
    expect(isValidSlotDuration(60)).toBe(true)
  })

  it("배수가 아니거나 0 이하면 막는다", () => {
    expect(isValidSlotDuration(20)).toBe(false)
    expect(isValidSlotDuration(0)).toBe(false)
    expect(isValidSlotDuration(-15)).toBe(false)
    expect(isValidSlotDuration(7.5)).toBe(false)
  })
})

describe("toSessionRequest", () => {
  const session = {
    id: "10",
    name: "디자인 파트 면접",
    startTime: "15:00",
    endTime: "18:00",
    mode: "online" as const,
    place: "https://meet.example.com/abc",
    slotDurationMinutes: 30,
  }

  it("편집 값을 서버 요청으로 옮긴다", () => {
    expect(toSessionRequest(session, "2026-08-04")).toEqual({
      name: "디자인 파트 면접",
      startsAt: "2026-08-04T06:00:00.000Z",
      endsAt: "2026-08-04T09:00:00.000Z",
      slotDurationMinutes: 30,
      mode: "ONLINE",
      location: "https://meet.example.com/abc",
    })
  })

  it("끝시각이 시작시각보다 빠르면 만들지 않는다", () => {
    expect(
      toSessionRequest({ ...session, endTime: "14:00" }, "2026-08-04"),
    ).toBeNull()
  })

  it("슬롯 시간이 15 의 배수가 아니면 만들지 않는다", () => {
    expect(
      toSessionRequest({ ...session, slotDurationMinutes: 20 }, "2026-08-04"),
    ).toBeNull()
  })

  it("이름이나 장소가 비면 만들지 않는다", () => {
    expect(
      toSessionRequest({ ...session, name: "  " }, "2026-08-04"),
    ).toBeNull()
    expect(toSessionRequest({ ...session, place: "" }, "2026-08-04")).toBeNull()
  })
})

describe("toEditableSession", () => {
  it("서버 세션을 편집 모델로 옮긴다", () => {
    expect(
      toEditableSession({
        id: "10",
        roundId: "3",
        name: "면접 A",
        startsAt: "2026-08-04T06:00:00Z",
        endsAt: "2026-08-04T09:00:00Z",
        slotDurationMinutes: 30,
        mode: "OFFLINE",
        location: "유엠관 107호",
      }),
    ).toEqual({
      id: "10",
      name: "면접 A",
      startTime: "15:00",
      endTime: "18:00",
      mode: "offline",
      place: "유엠관 107호",
      slotDurationMinutes: 30,
    })
  })
})

function boardSession(
  overrides: Partial<RecruitingBoardSession> = {},
): RecruitingBoardSession {
  return {
    sessionId: "10",
    name: "면접 A",
    startsAt: "2026-08-04T06:00:00Z",
    endsAt: "2026-08-04T07:00:00Z",
    mode: "ONLINE",
    location: "링크",
    slots: [],
    ...overrides,
  }
}

describe("toAssignmentsFromBoard", () => {
  it("배정된 슬롯만 배정 목록으로 편다", () => {
    const assignments = toAssignmentsFromBoard([
      boardSession({
        slots: [
          {
            startsAt: "2026-08-04T06:00:00Z",
            endsAt: "2026-08-04T06:30:00Z",
            availableApplicationIds: ["40"],
            assignedApplicant: { applicationId: "40", applicantName: "이예원" },
          },
          {
            startsAt: "2026-08-04T06:30:00Z",
            endsAt: "2026-08-04T07:00:00Z",
            availableApplicationIds: ["41"],
            assignedApplicant: null,
          },
        ],
      }),
    ])

    expect(assignments).toEqual([
      { sessionId: "10", slotStart: "15:00", applicantId: "40" },
    ])
  })
})

describe("toApplicantAvailabilities", () => {
  // 서버는 슬롯마다 가능한 지원자를 주는데 화면은 지원자마다 가능 시간을 보여준다.
  it("슬롯 기준 가능 목록을 지원자 기준으로 뒤집는다", () => {
    const result = toApplicantAvailabilities([
      boardSession({
        slots: [
          {
            startsAt: "2026-08-04T06:00:00Z",
            endsAt: "2026-08-04T06:30:00Z",
            availableApplicationIds: ["40", "41"],
            assignedApplicant: null,
          },
          {
            startsAt: "2026-08-04T06:30:00Z",
            endsAt: "2026-08-04T07:00:00Z",
            availableApplicationIds: ["40"],
            assignedApplicant: null,
          },
        ],
      }),
    ])

    expect(result.get("40")).toEqual(["15:00", "15:30"])
    expect(result.get("41")).toEqual(["15:00"])
  })

  it("같은 시각이 여러 세션에 있어도 한 번만 담는다", () => {
    const slot = {
      startsAt: "2026-08-04T06:00:00Z",
      endsAt: "2026-08-04T06:30:00Z",
      availableApplicationIds: ["40"],
      assignedApplicant: null,
    }
    const result = toApplicantAvailabilities([
      boardSession({ sessionId: "10", slots: [slot] }),
      boardSession({ sessionId: "11", slots: [slot] }),
    ])

    expect(result.get("40")).toEqual(["15:00"])
  })
})

describe("buildAssignmentPayload", () => {
  const assignments: SlotAssignment[] = [
    { sessionId: "10", slotStart: "15:00", applicantId: "40" },
    { sessionId: "10", slotStart: "15:30", applicantId: "41" },
  ]

  it("연락처를 붙여 확정 요청을 만든다", () => {
    const result = buildAssignmentPayload(
      assignments,
      "2026-08-04",
      new Map([
        ["40", "a@umc.org"],
        ["41", "b@umc.org"],
      ]),
    )

    expect(result.assignments).toEqual([
      {
        applicationId: 40,
        sessionId: 10,
        startsAt: "2026-08-04T06:00:00.000Z",
        contactSnapshot: "a@umc.org",
      },
      {
        applicationId: 41,
        sessionId: 10,
        startsAt: "2026-08-04T06:30:00.000Z",
        contactSnapshot: "b@umc.org",
      },
    ])
    expect(result.skipped).toEqual([])
  })

  // 서버가 빈 연락처를 거부한다. 보내고 실패하느니 빼고 알리는 편이 낫다.
  it("연락처가 없으면 빼고 알린다", () => {
    const result = buildAssignmentPayload(
      assignments,
      "2026-08-04",
      new Map([["40", "a@umc.org"]]),
    )

    expect(result.assignments).toHaveLength(1)
    expect(result.skipped).toEqual(["41"])
  })

  it("공백뿐인 연락처도 빼낸다", () => {
    const result = buildAssignmentPayload(
      assignments,
      "2026-08-04",
      new Map([
        ["40", "   "],
        ["41", "b@umc.org"],
      ]),
    )

    expect(result.skipped).toEqual(["40"])
  })
})
