import dayjs from "dayjs"

import { CHAPTERS } from "@/entities/organization/model/chapters"

import type {
  RecruitingRoundGroup,
  RecruitingSeasonConfigurationResponse,
} from "../api/types"
import type { ChapterQuotaData, SchoolQuotaRow } from "./recruitmentQuota"

export function mapGroupsToChapterQuotaData(
  groups: RecruitingRoundGroup[],
  seasonConfigsMap: Map<string, RecruitingSeasonConfigurationResponse>,
  now?: Date,
): ChapterQuotaData[] {
  const byChapter = new Map<string, RecruitingRoundGroup[]>()

  groups.forEach((group) => {
    const chapterName = group.chapterName
    if (!byChapter.has(chapterName)) {
      byChapter.set(chapterName, [])
    }
    byChapter.get(chapterName)!.push(group)
  })

  const updatedDate = now ? dayjs(now).format("YY-MM-DD") : undefined
  const updatedTime = now ? dayjs(now).format("HH:mm") : undefined

  const chapters = CHAPTERS.length > 0 ? CHAPTERS : Array.from(byChapter.keys())

  return chapters.map((chapterName) => {
    const chapterGroups = byChapter.get(chapterName) ?? []
    const schools: SchoolQuotaRow[] = chapterGroups.map((group) => {
      const config = seasonConfigsMap.get(group.seasonId)
      const hasConfig = Boolean(config)
      const quotas = config?.quotas ?? []

      const pm = quotas.find((q) => q.track === "PLAN")?.targetCount ?? 0
      const design = quotas.find((q) => q.track === "DESIGN")?.targetCount ?? 0
      const webPe =
        quotas.find((q) => q.track === "WEB_PRODUCT_ENGINEER")?.targetCount ?? 0
      const mobilePe =
        quotas.find((q) => q.track === "MOBILE_PRODUCT_ENGINEER")
          ?.targetCount ?? 0

      return {
        seasonId: hasConfig ? group.seasonId : undefined,
        gisuId: group.gisuId,
        schoolId: group.schoolId,
        schoolName: group.schoolName,
        pm,
        design,
        webPe,
        mobilePe,
        total: pm + design + webPe + mobilePe,
      }
    })

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
