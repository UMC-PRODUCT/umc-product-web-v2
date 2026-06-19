import type { MatchingRoleRow } from "../ui/MatchingResultRow"

export interface MatchingProjectData {
  projectId?: string
  projectName: string
  challengerName: string
  challengerUniversity: string
  backendPart: "springboot" | "nodejs"
  roleRows: MatchingRoleRow[]
  status: "recruiting" | "completed"
  currentCount?: number
  totalCount?: number
  thumbnailUrl?: string
}

export interface MatchingPartData {
  partName: string
  projects: MatchingProjectData[]
}

export type PartRole =
  | "plan"
  | "design"
  | "web"
  | "ios"
  | "android"
  | "springboot"
  | "nodejs"

export interface AssignableChallenger {
  id: string
  nickname: string
  university: string
  partRole: PartRole
}
