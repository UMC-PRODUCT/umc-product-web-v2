import dayjs from "dayjs"

import { CHAPTERS } from "@/entities/organization/model/chapters"

import type {
  RecruitingRoundGroup,
  RecruitingSeasonConfigurationResponse,
} from "../api/types"
import type { ChapterQuotaData, SchoolQuotaRow } from "./recruitmentQuota"

export interface ServerChapterItem {
  chapterId: string | number
  chapterName: string
  schools: Array<{
    schoolId: string | number
    schoolName: string
  }>
}

export function mapGroupsToChapterQuotaData(
  groups: RecruitingRoundGroup[],
  seasonConfigsMap: Map<string, RecruitingSeasonConfigurationResponse>,
  serverChaptersOrNow?: ServerChapterItem[] | Date,
  gisuId?: string,
  now?: Date,
): ChapterQuotaData[] {
  let serverChapters: ServerChapterItem[] | undefined
  let actualNow = now

  if (serverChaptersOrNow instanceof Date) {
    actualNow = serverChaptersOrNow
  } else {
    serverChapters = serverChaptersOrNow
  }

  const byChapter = new Map<string, RecruitingRoundGroup[]>()

  groups.forEach((group) => {
    const chapterName = group.chapterName
    if (!byChapter.has(chapterName)) {
      byChapter.set(chapterName, [])
    }
    byChapter.get(chapterName)!.push(group)
  })

  const serverChaptersMap = new Map<
    string,
    Array<{ schoolId: string; schoolName: string }>
  >()

  if (serverChapters && serverChapters.length > 0) {
    serverChapters.forEach((ch) => {
      serverChaptersMap.set(
        ch.chapterName,
        ch.schools.map((s) => ({
          schoolId: String(s.schoolId),
          schoolName: s.schoolName,
        })),
      )
    })
  }

  const updatedDate = actualNow
    ? dayjs(actualNow).format("YY-MM-DD")
    : undefined
  const updatedTime = actualNow ? dayjs(actualNow).format("HH:mm") : undefined

  const chapters = CHAPTERS.length > 0 ? CHAPTERS : Array.from(byChapter.keys())

  return chapters.map((chapterName) => {
    const chapterGroups = byChapter.get(chapterName) ?? []
    const serverSchools = serverChaptersMap.get(chapterName) ?? []

    const groupSchoolIds = new Set<string>()
    const groupSchoolNames = new Set<string>()

    const schoolsFromGroups: SchoolQuotaRow[] = chapterGroups.map((group) => {
      groupSchoolIds.add(String(group.schoolId))
      groupSchoolNames.add(group.schoolName)

      const config = seasonConfigsMap.get(group.seasonId)
      const quotas = config?.quotas ?? []

      const pm = quotas.find((q) => q.track === "PLAN")?.targetCount ?? 0
      const design = quotas.find((q) => q.track === "DESIGN")?.targetCount ?? 0
      const webPe =
        quotas.find((q) => q.track === "WEB_PRODUCT_ENGINEER")?.targetCount ?? 0
      const mobilePe =
        quotas.find((q) => q.track === "MOBILE_PRODUCT_ENGINEER")
          ?.targetCount ?? 0

      return {
        // 시즌이 있는지는 모집 목록이 이미 알려 준다. 설정 응답은 시즌마다
        // 따로 오는데, 그것을 기다려 seasonId 를 비우면 편집 권한 판정이
        // 로딩 상태에 끌려간다. 아직 안 온 시즌은 인원만 0으로 보인다.
        seasonId: group.seasonId,
        gisuId: group.gisuId || gisuId,
        schoolId: String(group.schoolId),
        schoolName: group.schoolName,
        pm,
        design,
        webPe,
        mobilePe,
        total: pm + design + webPe + mobilePe,
      }
    })

    const missingSchoolsFromChapter: SchoolQuotaRow[] = serverSchools
      .filter(
        (s) =>
          !groupSchoolIds.has(s.schoolId) &&
          !groupSchoolNames.has(s.schoolName),
      )
      .map((s) => ({
        seasonId: undefined,
        gisuId,
        schoolId: s.schoolId,
        schoolName: s.schoolName,
        pm: 0,
        design: 0,
        webPe: 0,
        mobilePe: 0,
        total: 0,
      }))

    const schools: SchoolQuotaRow[] = [
      ...schoolsFromGroups,
      ...missingSchoolsFromChapter,
    ]

    const totals = schools.reduce(
      (acc, s) => ({
        pm: acc.pm + s.pm,
        design: acc.design + s.design,
        webPe: acc.webPe + s.webPe,
        mobilePe: acc.mobilePe + s.mobilePe,
        total: acc.total + s.total,
      }),
      { pm: 0, design: 0, webPe: 0, mobilePe: 0, total: 0 },
    )

    return {
      chapter: chapterName,
      schoolCount: schools.length,
      updatedDate,
      updatedTime,
      schools,
      totals,
    }
  })
}
