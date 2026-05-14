export type PartEnum =
  | "PLAN"
  | "DESIGN"
  | "WEB"
  | "ANDROID"
  | "IOS"
  | "NODEJS"
  | "SPRINGBOOT"
  | "ADMIN"

export type NoticeTabEnum =
  | "CHALLENGER"
  | "CENTRAL_MEMBER"
  | "SCHOOL_CORE"
  | "SCHOOL_PART_LEADER"

export interface NoticeSummaryResponse {
  content: NoticeSummaryResponseContent[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface NoticeSummaryResponseContent {
  id: number
  title: string
  content: string
  shouldSendNotification: boolean
  mustRead: boolean
  viewCount: number
  createdAt: string
  targetInfo: {
    targetGisuId: number
    targetChapterId: number
    targetSchoolId: number
    targetParts: PartEnum[]
    targetNoticeTab: NoticeTabEnum
  }
  authorChallengerId: number
  authorMemberId: number
  authorNickname: string
  authorName: string
}
