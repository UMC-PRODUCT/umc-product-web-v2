export type StatusValue = "pass" | "fail" | "pending"

export type Role =
  | "plan"
  | "design"
  | "web"
  | "ios"
  | "android"
  | "springboot"
  | "nodejs"

export interface FormField {
  label: string
  question: string
  answer: string
  required?: boolean
}

export interface ApplicantFormData {
  applicantId: string
  chapter: string
  role: Role
  projectName: string
  challengerName: string
  challengerUniversity: string
  commonFields: FormField[]
  roleSection?: {
    title: string
    fields: FormField[]
  }
}

export interface AssignmentCount {
  current: number
  total: number
}

export interface RoundCount {
  round: number
  applied: number
  total: number
}

export interface TopProject {
  projectId: string
  name: string
  count: number
}

export interface UniversityCount {
  name: string
  applied: number
  total: number
}

export interface ProjectRoundData {
  name: string
  rounds: number[]
}

export interface ApplicationStats {
  totalMembers: number
  completionRate: number
  completedCount: number
  pendingCount: number
  rounds: RoundCount[]
  topProjects: TopProject[]
  universities: UniversityCount[]
  projectRounds: ProjectRoundData[]
}

export interface ApplicantDetail {
  id: string
  round: number
  role: Role
  name: string
  university: string
  status: StatusValue
  processedAt: { date: string; time: string } | null
  appliedAt: { date: string; time: string }
}

export interface ProjectApplication {
  id: string
  projectName: string
  role: Role
  parts: Role[] // 프로젝트에 할당된 파트 목록 (quota > 0)
  challengerName: string
  challengerUniversity: string
  thumbnailUrl?: string
  statusLabel: string
  designCount: AssignmentCount
  feCount: AssignmentCount
  beCount: AssignmentCount
  applicants: ApplicantDetail[]
}

export interface ChallengerProjectInfo {
  projectName: string
  pmName: string
  pmUniversity: string
  thumbnailUrl?: string
}

export interface UniversityApplicant {
  name: string
  count: number
}

export interface ChallengerStats {
  completionRate: number
  rounds: RoundCount[]
  universities: UniversityApplicant[]
  totalApplicants: number
}
