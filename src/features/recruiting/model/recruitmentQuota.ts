export interface SchoolQuotaRow {
  schoolName: string
  pm: number
  design: number
  webPe: number
  mobilePe: number
  total: number
}

export interface PartCounts {
  pm: number
  design: number
  webPe: number
  mobilePe: number
}

export interface ChapterQuotaData {
  chapter: string
  schoolCount: number
  updatedDate: string
  updatedTime: string
  schools: SchoolQuotaRow[]
  totals: PartCounts & { total: number }
}
