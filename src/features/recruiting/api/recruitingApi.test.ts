import { describe, expect, it } from "vitest"

import {
  mergeRoundGroups,
  normalizeAdminRoundGroups,
  normalizeEvaluationStatistics,
  normalizeRecruitingSeasonConfigurationResponse,
  normalizeStatusSummary,
} from "./recruitingApi"

import type {
  RawAdminRound,
  RawAdminRoundGroup,
  RawEvaluationStatistics,
  RawRecruitingSeasonConfigurationResponse,
  RawStatusSummary,
  RecruitingRound,
  RecruitingRoundGroup,
} from "./types"

function round(roundId: string): RecruitingRound {
  return {
    roundId,
    title: `차수 ${roundId}`,
    type: "REGULAR",
    roundNo: 1,
    recruitableTracks: [],
    secondChoiceEnabled: false,
    documentStartAt: null,
    documentEndAt: null,
    documentResultPublishedAt: null,
    interviewRequired: true,
    interviewStartAt: null,
    interviewEndAt: null,
    finalResultPublishedAt: null,
    announcement: null,
    applicationFormId: "9",
    formId: "9",
    applicationOpen: false,
  }
}

function group(
  seasonId: string,
  rounds: RecruitingRound[],
): RecruitingRoundGroup {
  return {
    seasonId,
    gisuId: "5",
    chapterId: "1",
    chapterName: "서울",
    schoolId: "2",
    schoolName: "중앙대학교",
    rounds,
  }
}

describe("normalizeAdminRoundGroups", () => {
  // 공개 응답을 그대로 쓰지 않고 관리자 응답 모양으로 따로 만든다. 공개 전용
  // 필드(applicationFormId·formId·applicationOpen)는 관리자 응답에 오지 않는다.
  function adminRound(overrides: Partial<RawAdminRound> = {}): RawAdminRound {
    return {
      id: 20,
      title: "차수",
      type: "REGULAR",
      roundNo: 1,
      recruitableTracks: [],
      secondChoiceEnabled: false,
      documentStartAt: null,
      documentEndAt: null,
      documentResultPublishedAt: null,
      interviewRequired: true,
      interviewStartAt: null,
      interviewEndAt: null,
      finalResultPublishedAt: null,
      announcement: null,
      ...overrides,
    }
  }

  function adminGroup(
    rounds: RawAdminRoundGroup["rounds"],
  ): RawAdminRoundGroup {
    return { ...group("100", []), rounds }
  }

  it("관리자 응답의 id 를 roundId 로 옮긴다", () => {
    const [normalized] = normalizeAdminRoundGroups([
      adminGroup([adminRound({ id: 20 })]),
    ])

    // 이 변환이 빠지면 목록 카드의 postId 와 수정 화면의 차수 조회가 전부
    // undefined 가 된다.
    expect(normalized?.rounds[0]?.roundId).toBe("20")
  })

  it("관리자 전용 필드를 그대로 남긴다", () => {
    const [normalized] = normalizeAdminRoundGroups([
      adminGroup([
        adminRound({ status: "DRAFT", contactText: "010-0000-0000" }),
      ]),
    ])

    expect(normalized?.rounds[0]?.status).toBe("DRAFT")
    expect(normalized?.rounds[0]?.contactText).toBe("010-0000-0000")
  })

  it("서버가 roundId 를 주기 시작해도 그 값을 쓴다", () => {
    const [normalized] = normalizeAdminRoundGroups([
      adminGroup([adminRound({ id: 20, roundId: 31 })]),
    ])

    expect(normalized?.rounds[0]?.roundId).toBe("31")
  })

  // 식별자가 없으면 수정·삭제·복제가 전부 빈 경로로 나간다. 목록에 남겨 두면
  // 눌렀을 때 실패하므로 아예 빼는 편이 낫다.
  it("식별자가 없는 차수는 목록에서 뺀다", () => {
    // 타입에는 id 가 필수지만 응답이 그 계약을 어길 수 있다. 그 경우를 재현한다.
    const contractViolating = [
      { ...adminRound(), id: undefined },
      { ...adminRound(), id: "", title: "빈 식별자" },
      adminRound({ id: 21, title: "정상" }),
    ] as RawAdminRound[]

    const [normalized] = normalizeAdminRoundGroups([
      adminGroup(contractViolating),
    ])

    expect(normalized?.rounds.map((item) => item.roundId)).toEqual(["21"])
  })

  it("차수가 없는 시즌도 빈 배열로 살린다", () => {
    const [normalized] = normalizeAdminRoundGroups([adminGroup(undefined)])

    // 차수를 하나도 안 만든 시즌은 모집 생성 화면이 seasonId 를 얻는 유일한
    // 통로라 빠뜨리면 안 된다.
    expect(normalized?.seasonId).toBe("100")
    expect(normalized?.rounds).toEqual([])
  })
})

describe("mergeRoundGroups", () => {
  it("같은 시즌의 차수를 한 그룹으로 합친다", () => {
    const merged = mergeRoundGroups([
      group("100", [round("1")]),
      group("100", [round("2")]),
    ])

    expect(merged).toHaveLength(1)
    expect(merged[0]?.rounds.map((item) => item.roundId)).toEqual(["1", "2"])
  })

  it("두 구간에 겹쳐 나온 차수를 중복으로 남기지 않는다", () => {
    const merged = mergeRoundGroups([
      group("100", [round("1"), round("2")]),
      group("100", [round("2"), round("3")]),
    ])

    expect(merged[0]?.rounds.map((item) => item.roundId)).toEqual([
      "1",
      "2",
      "3",
    ])
  })

  it("시즌이 다르면 그룹을 나눠 둔다", () => {
    const merged = mergeRoundGroups([
      group("100", [round("1")]),
      group("200", [round("2")]),
    ])

    expect(merged.map((item) => item.seasonId)).toEqual(["100", "200"])
  })

  it("빈 입력은 빈 결과가 된다", () => {
    expect(mergeRoundGroups([])).toEqual([])
  })
})

describe("normalizeStatusSummary", () => {
  // 2026-07-30 dev 실응답 형태. 스펙은 int64 지만 서버는 문자열로 준다.
  const rawResponse: RawStatusSummary = {
    totalCount: "12",
    countByStatus: { SUBMITTED: "7", FINAL_PASSED: "5" },
    schools: [
      {
        schoolId: "1",
        schoolName: "가천대학교",
        chapterId: "27",
        chapterName: "Neon",
        totalCount: "5",
        countByStatus: { SUBMITTED: "5" },
        rounds: [
          {
            roundId: "10",
            roundTitle: "10기 본모집",
            roundType: "REGULAR" as const,
            roundNo: 1,
            totalCount: "5",
            countByStatus: { SUBMITTED: "5" },
          },
        ],
      },
      {
        schoolId: "2",
        schoolName: "가톨릭대학교",
        chapterId: "28",
        chapterName: "Xenon",
        totalCount: "7",
        countByStatus: {},
        rounds: [],
      },
    ],
  }

  it("문자열 건수를 숫자로 바꾼다", () => {
    const result = normalizeStatusSummary(rawResponse)

    expect(result.totalCount).toBe(12)
    expect(result.countByStatus.SUBMITTED).toBe(7)
    expect(result.schools[0]?.totalCount).toBe(5)
    expect(result.schools[0]?.rounds[0]?.totalCount).toBe(5)
    expect(result.schools[0]?.rounds[0]?.countByStatus.SUBMITTED).toBe(5)
  })

  // 문자열로 두면 합산이 "5" + "7" = "57" 이 되어 조용히 틀린다.
  it("학교 건수를 더하면 문자열 연결이 아니라 산술 합이 된다", () => {
    const result = normalizeStatusSummary(rawResponse)
    const sum = result.schools.reduce(
      (acc, school) => acc + school.totalCount,
      0,
    )

    expect(sum).toBe(12)
  })

  it("ID 는 문자열로 고정한다", () => {
    const result = normalizeStatusSummary({
      ...rawResponse,
      schools: [
        { ...rawResponse.schools![0]!, schoolId: 1, chapterId: 27, rounds: [] },
      ],
    })

    expect(result.schools[0]?.schoolId).toBe("1")
    expect(result.schools[0]?.chapterId).toBe("27")
  })

  it("빠진 배열과 객체를 빈 값으로 채운다", () => {
    const result = normalizeStatusSummary({ totalCount: "0" })

    expect(result).toEqual({
      totalCount: 0,
      countByStatus: {},
      parts: [],
      schools: [],
    })
  })

  // Number("") 는 0 이라 가드가 없어도 통과한다. NaN 이 되는 값을 써야 검증된다.
  it("숫자로 바꿀 수 없는 값은 0 으로 둔다", () => {
    expect(normalizeStatusSummary({ totalCount: "abc" }).totalCount).toBe(0)
    expect(normalizeStatusSummary({ totalCount: "" }).totalCount).toBe(0)
  })
})

describe("normalizeEvaluationStatistics", () => {
  // 2026-07-30 dev 실응답 형태. 건수가 전부 문자열로 온다.
  const rawStatistics: RawEvaluationStatistics = {
    asOf: "2026-07-30T10:22:48.103915815Z",
    applicantCount: "24",
    evaluatedCount: "12",
    byTrack: [
      { track: "PLAN", applicantCount: "10", evaluatedCount: "4" },
      { track: "DESIGN", applicantCount: "8", evaluatedCount: "8" },
    ],
    chapters: [
      {
        chapterId: "29",
        chapterName: "Chromium",
        applicantCount: "20",
        evaluatedCount: "10",
        byTrack: [{ track: "PLAN", applicantCount: "10", evaluatedCount: "4" }],
        schools: [
          {
            schoolId: "6",
            schoolName: "광운대학교",
            applicantCount: "12",
            evaluatedCount: "6",
            byTrack: [
              { track: "PLAN", applicantCount: "6", evaluatedCount: "3" },
            ],
          },
        ],
      },
    ],
  }

  it("3단 전체의 문자열 건수를 숫자로 바꾼다", () => {
    const result = normalizeEvaluationStatistics(rawStatistics)

    expect(result.applicantCount).toBe(24)
    expect(result.byTrack[0]?.evaluatedCount).toBe(4)
    expect(result.chapters[0]?.applicantCount).toBe(20)
    expect(result.chapters[0]?.byTrack[0]?.applicantCount).toBe(10)
    expect(result.chapters[0]?.schools[0]?.evaluatedCount).toBe(6)
    expect(result.chapters[0]?.schools[0]?.byTrack[0]?.evaluatedCount).toBe(3)
  })

  it("ID 는 문자열로 고정한다", () => {
    const result = normalizeEvaluationStatistics({
      ...rawStatistics,
      chapters: [
        {
          ...rawStatistics.chapters![0]!,
          chapterId: 29,
          schools: [
            { ...rawStatistics.chapters![0]!.schools![0]!, schoolId: 6 },
          ],
        },
      ],
    })

    expect(result.chapters[0]?.chapterId).toBe("29")
    expect(result.chapters[0]?.schools[0]?.schoolId).toBe("6")
  })

  it("asOf 가 없으면 null 로 둔다", () => {
    const result = normalizeEvaluationStatistics({
      applicantCount: "0",
      evaluatedCount: "0",
    })

    expect(result.asOf).toBeNull()
    expect(result.byTrack).toEqual([])
    expect(result.chapters).toEqual([])
  })
})

describe("normalizeRecruitingSeasonConfigurationResponse", () => {
  const rawSeason: RawRecruitingSeasonConfigurationResponse = {
    id: 10,
    gisuId: 15,
    schoolId: 3,
    memo: "시즌 메모",
    quotas: [
      { track: "PLAN", targetCount: "5" },
      { track: "DESIGN", targetCount: "3" },
    ],
    rounds: [],
  }

  it("ID를 문자열로, targetCount를 숫자로 정규화한다", () => {
    const result = normalizeRecruitingSeasonConfigurationResponse(rawSeason)

    expect(result.id).toBe("10")
    expect(result.gisuId).toBe("15")
    expect(result.schoolId).toBe("3")
    expect(result.memo).toBe("시즌 메모")
    expect(result.quotas).toEqual([
      { track: "PLAN", targetCount: 5 },
      { track: "DESIGN", targetCount: 3 },
    ])
  })

  it("빠진 필드를 기본값으로 채운다", () => {
    const result = normalizeRecruitingSeasonConfigurationResponse({})

    expect(result.id).toBe("")
    expect(result.gisuId).toBe("")
    expect(result.schoolId).toBe("")
    expect(result.memo).toBeNull()
    expect(result.quotas).toEqual([])
    expect(result.rounds).toEqual([])
  })

  it("track이 없는 quota 항목은 걸러낸다", () => {
    const result = normalizeRecruitingSeasonConfigurationResponse({
      quotas: [{ track: "DESIGN", targetCount: "3" }, { targetCount: "5" }],
    })

    expect(result.quotas).toEqual([{ track: "DESIGN", targetCount: 3 }])
  })
})
