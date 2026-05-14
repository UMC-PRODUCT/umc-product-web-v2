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

// GET /api/v1/notices 응답 항목
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
  createdAt: string // "2026-05-14T11:10:02.955Z"
  targetInfo: TargetInfo
  authorChallengerId: number
  authorMemberId: number
  authorNickname: string
  authorName: string
}

export interface TargetInfo {
  targetGisuId: number
  targetChapterId: number
  targetSchoolId: number
  targetParts: PartEnum[]
  targetNoticeTab: NoticeTabEnum
}

// GET /api/v1/notices/{noticeId} 응답 항목
export interface NoticeDetailResponse {
  id: number
  title: string
  content: string
  authorChallengerId: number
  authorMemberId: number
  mustRead: boolean
  vote: {
    voteId: number
    title: string
    isAnonymous: boolean
    allowMultipleChoice: boolean
    status: string
    startsAt: string // "2026-05-14T11:10:02.955Z"
    endsAtExclusive: string
    totalParticipants: number
    options: [
      {
        optionId: number
        content: string
        voteCount: number
        voteRate: number
        selectedMemberIds: number[]
      },
    ]
    mySelectedOptionIds: number[]
  }
  images: [
    {
      id: number
      url: string
      displayOrder: number
    },
  ]
  links: [
    {
      id: number
      url: string
      displayOrder: number
    },
  ]
  targetInfo: TargetInfo
  viewCount: number
  createdAt: string // "2026-05-14T11:10:02.955Z"
}

// POST /api/v1/notices Request Body
export interface PostNoticeRequest {
  title: string
  content: string
  shouldNotify: boolean
  mustRead: boolean
  targetInfo: TargetInfo
}

// POST /api/v1/notices 응답 항목
export interface PostNoticeResponse {
  noticeId: number
}

// PATCH /api/v1/notices/{noticeId} Request Body
export interface PatchNoticeRequest {
  title: string
  content: string
  mustRead: boolean
}
