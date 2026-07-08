import type { ProjectStatus } from "../api/matchingProject"

export type ProjectRecruitRow = {
  part: string
  current: number
  total: number
  done?: boolean
}

export type PartQuotaStatus = "RECRUITING" | "COMPLETED"

export function isRecruitDone(row: ProjectRecruitRow): boolean {
  return row.done ?? (row.total > 0 && row.current >= row.total)
}

export type ProjectCoverImage = {
  src: string
  alt?: string
}

export type MatchingProject = {
  id: string
  branch: string
  school: string
  title: string
  description: string
  authorSchoolLine: string
  logoImage?: ProjectCoverImage | null
  coverImage?: ProjectCoverImage | null
  recruitRows: ProjectRecruitRow[]
  partQuotaStatus?: PartQuotaStatus
  isApplied?: boolean
  externalLink?: string | null
  status?: ProjectStatus
}
