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
  status: string
  headerTO: PartCounts
  schools: SchoolQuotaRow[]
  remaining?: {
    pm?: number | string
    design?: number | string
    webPe?: number | string
    mobilePe?: number | string
    total: number
  }
  totals: PartCounts & { total: number }
}
