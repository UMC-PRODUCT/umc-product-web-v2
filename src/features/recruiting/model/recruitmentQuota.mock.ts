import { CHAPTERS } from "@/entities/organization/model/chapters"

import type { ChapterQuotaData } from "./recruitmentQuota"

export const RECRUITMENT_QUOTA_MOCK: ChapterQuotaData[] = [
  {
    chapter: "Chromium",
    schoolCount: 10,
    updatedDate: "26-07-04",
    updatedTime: "02:48",
    schools: [],
    totals: { pm: 0, design: 0, webPe: 0, mobilePe: 0, total: 0 },
  },
  {
    chapter: "Ferrum",
    schoolCount: 10,
    updatedDate: "26-07-04",
    updatedTime: "02:48",
    schools: [
      {
        schoolName: "가가대",
        pm: 20,
        design: 20,
        webPe: 30,
        mobilePe: 30,
        total: 100,
      },
      {
        schoolName: "나나대",
        pm: 20,
        design: 30,
        webPe: 40,
        mobilePe: 40,
        total: 130,
      },
      {
        schoolName: "다다대",
        pm: 20,
        design: 30,
        webPe: 40,
        mobilePe: 40,
        total: 130,
      },
    ],
    totals: {
      pm: 63,
      design: 80,
      webPe: 115,
      mobilePe: 110,
      total: 366,
    },
  },
]

export function getChapterQuotaData(
  quotaDataList: ChapterQuotaData[],
  chapter: string,
): ChapterQuotaData {
  const found = quotaDataList.find((item) => item.chapter === chapter)
  if (found) return found

  return {
    chapter,
    schoolCount: 10,
    updatedDate: "26-07-04",
    updatedTime: "02:48",
    schools: [],
    totals: { pm: 0, design: 0, webPe: 0, mobilePe: 0, total: 0 },
  }
}

export function getAllChaptersQuotaData(
  quotaDataList: ChapterQuotaData[],
): ChapterQuotaData[] {
  return CHAPTERS.map((chapter) => getChapterQuotaData(quotaDataList, chapter))
}
