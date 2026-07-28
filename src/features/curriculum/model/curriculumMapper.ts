import type {
  CurriculumOverviewResponse,
  CurriculumPart,
  WeeklyCurriculumOverviewResponse,
} from "@/entities/curriculum"

import type { CurriculumItem, Workbook } from "./curriculumData"

/**
 * UI Part 탭 문자열을 API CurriculumPart Enum으로 매핑
 */
export function mapPartToApiEnum(part: string): CurriculumPart {
  switch (part) {
    case "PM":
      return "PLAN"
    case "Design":
      return "DESIGN"
    case "Web PE":
      return "WEB"
    case "Mobile PE":
      return "ANDROID"
    case "Infra Plus":
      return "ADMIN"
    default:
      return "PLAN"
  }
}

/**
 * API CurriculumPart Enum을 UI Part 탭 문자열로 매핑
 */
export function mapApiEnumToPart(part: CurriculumPart): string {
  switch (part) {
    case "PLAN":
      return "PM"
    case "DESIGN":
      return "Design"
    case "WEB":
      return "Web PE"
    case "ANDROID":
    case "IOS":
      return "Mobile PE"
    case "NODEJS":
    case "SPRINGBOOT":
    case "ADMIN":
      return "Infra Plus"
    default:
      return "PM"
  }
}

/**
 * 서버 WeeklyCurriculumOverviewResponse -> UI Workbook 변환
 */
export function mapWeeklyOverviewToWorkbook(
  week: WeeklyCurriculumOverviewResponse,
  index: number,
): Workbook {
  return {
    id: week.weeklyCurriculumId
      ? String(week.weeklyCurriculumId)
      : `wb-${Date.now()}-${index}`,
    number: week.weekNo ?? index + 1,
    title: week.title ?? "",
    missions: [],
  }
}

/**
 * 서버 CurriculumOverviewResponse -> UI CurriculumItem 변환
 */
export function mapOverviewToCurriculumItem(
  overview: CurriculumOverviewResponse,
  index: number,
): CurriculumItem {
  const workbooks: Workbook[] = (overview.weeks || []).map((w, idx) =>
    mapWeeklyOverviewToWorkbook(w, idx),
  )

  const numberStr = String(index + 1).padStart(2, "0")

  return {
    id: overview.curriculumId
      ? String(overview.curriculumId)
      : `curriculum-${Date.now()}-${index}`,
    number: numberStr,
    title: overview.title ?? "",
    workbookCount: workbooks.length,
    missionCount: 0,
    workbooks,
  }
}
