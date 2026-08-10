import { describe, expect, it } from "vitest"

import { mapRoundToDraftBasicInfo } from "./recruitmentDraftBasicInfo"

import type { RecruitingRound, RecruitingRoundGroup } from "../api/types"

const group = (
  overrides: Partial<RecruitingRoundGroup> = {},
): RecruitingRoundGroup => ({
  seasonId: "9",
  gisuId: "5",
  chapterId: "1",
  chapterName: "Neon",
  schoolId: "3",
  schoolName: "가천대학교",
  rounds: [],
  ...overrides,
})

const round = (overrides: Partial<RecruitingRound> = {}): RecruitingRound => ({
  roundId: "13",
  title: "가천대 UMC 10기 정규 모집",
  type: "REGULAR",
  roundNo: 1,
  recruitableTracks: [],
  secondChoiceEnabled: false,
  documentStartAt: null,
  documentEndAt: null,
  documentResultPublishedAt: null,
  interviewRequired: false,
  interviewStartAt: null,
  interviewEndAt: null,
  finalResultPublishedAt: null,
  announcement: null,
  ...overrides,
})

describe("mapRoundToDraftBasicInfo", () => {
  it("지부와 학교를 폼이 쓰는 형태로 되돌린다", () => {
    const result = mapRoundToDraftBasicInfo(group(), round(), 10)

    expect(result.seasonId).toBe("9")
    expect(result.roundId).toBe("13")
    expect(result.basicInfo.chapter).toBe("Neon")
    expect(result.basicInfo.school).toBe("가천대")
    expect(result.basicInfo.recruitmentType).toBe("REGULAR")
    expect(result.basicInfo.roundNo).toBe("1")
  })

  // 지부 목록이 서버 조회로 바뀌어 이름을 미리 알 수 없다. 그래서 모르는
  // 이름도 그대로 싣고, 값이 없는 것만 비운다.
  it("처음 보는 지부 이름도 그대로 싣는다", () => {
    const result = mapRoundToDraftBasicInfo(
      group({ chapterName: "새로생긴지부" }),
      round(),
      10,
    )

    expect(result.basicInfo.chapter).toBe("새로생긴지부")
  })

  it("지부 이름이 비어 있으면 비운다", () => {
    const result = mapRoundToDraftBasicInfo(
      group({ chapterName: "   " }),
      round(),
      10,
    )

    expect(result.basicInfo.chapter).toBeUndefined()
  })

  it("기간을 날짜와 시간 칸으로 쪼갠다", () => {
    const documentStartAt = "2026-08-01T09:30:00.000Z"
    const result = mapRoundToDraftBasicInfo(
      group(),
      round({ documentStartAt }),
      10,
    )

    expect(result.basicInfo.periodForm.documentStartAt).toEqual({
      date: "2026-08-01",
      time: "09:30",
    })
  })

  it("비어 있는 기간은 초기값으로 둔다", () => {
    const result = mapRoundToDraftBasicInfo(group(), round(), 10)

    expect(result.basicInfo.periodForm.documentEndAt).toEqual({
      date: "",
      time: "23:59",
    })
  })

  it("깨진 기간 값도 초기값으로 떨어진다", () => {
    const result = mapRoundToDraftBasicInfo(
      group(),
      round({ documentStartAt: "언제였더라" }),
      10,
    )

    expect(result.basicInfo.periodForm.documentStartAt).toEqual({
      date: "",
      time: "00:00",
    })
  })

  // 제목은 저장할 때 접두사가 붙는다. 되돌릴 때 떼지 않으면 다시 저장할 때마다
  // 접두사가 겹쳐 쌓인다.
  it("제목에서 자동 접두사를 떼어 꼬리말만 남긴다", () => {
    const result = mapRoundToDraftBasicInfo(
      group(),
      round({ title: "가천대 UMC 10기 정규 모집 프론트엔드 집중" }),
      10,
    )

    expect(result.basicInfo.footer).toBe("프론트엔드 집중")
  })

  it("추가 모집은 차수까지 포함해 접두사를 뗀다", () => {
    const result = mapRoundToDraftBasicInfo(
      group(),
      round({
        type: "ADDITIONAL",
        roundNo: 3,
        title: "가천대 UMC 10기 3차 추가 모집 마지막 모집",
      }),
      10,
    )

    expect(result.basicInfo.footer).toBe("마지막 모집")
  })

  it("접두사 규칙에 맞지 않는 제목은 꼬리말을 비운다", () => {
    const result = mapRoundToDraftBasicInfo(
      group(),
      round({ title: "손으로 쓴 제목" }),
      10,
    )

    expect(result.basicInfo.footer).toBe("")
  })

  it("공지와 문의는 없으면 빈 문자열로 준다", () => {
    const result = mapRoundToDraftBasicInfo(group(), round(), 10)

    expect(result.announcement).toBe("")
    expect(result.contactText).toBe("")
  })

  it("공지와 문의가 있으면 그대로 싣는다", () => {
    const result = mapRoundToDraftBasicInfo(
      group(),
      round({ announcement: "지원 전 확인", contactText: "010-0000-0000" }),
      10,
    )

    expect(result.announcement).toBe("지원 전 확인")
    expect(result.contactText).toBe("010-0000-0000")
  })
})
