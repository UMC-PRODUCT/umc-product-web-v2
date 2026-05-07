import type {
  MatchingBlockData,
  MatchingRoleRow,
} from "../ui/MatchingResultRow"

export interface MatchingProjectData {
  projectName: string
  challengerName: string
  challengerUniversity: string
  partRole:
    | "plan"
    | "design"
    | "web"
    | "ios"
    | "android"
    | "springboot"
    | "nodejs"
  roleRows: MatchingRoleRow[]
  status: "recruiting" | "completed"
  currentCount?: number
  totalCount?: number
}

export interface MatchingPartData {
  partName: string
  projects: MatchingProjectData[]
}

let blockIdCounter = 0

function filledBlock(
  name: string,
  variant: "round1" | "round2" | "round3" | "random",
): MatchingBlockData {
  const applicantId = `m-${++blockIdCounter}`
  return variant === "round1"
    ? { type: "round1", name, applicantId }
    : { type: "filled", name, tagVariant: variant, applicantId }
}

function emptyBlock(): MatchingBlockData {
  return { type: "none" }
}

function blockedBlock(): MatchingBlockData {
  return { type: "blocked" }
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

// 역할 행 라벨 -> PartTagChip role 매핑
export const ROLE_LABEL_TO_PART: Record<string, PartRole> = {
  Frontend: "web",
  Backend: "springboot",
  Design: "design",
}

export const MOCK_ASSIGNABLE_CHALLENGERS: AssignableChallenger[] = [
  // Web (Frontend)
  { id: "ac-1", nickname: "김소영", university: "중앙대학교", partRole: "web" },
  { id: "ac-2", nickname: "이준혁", university: "경희대학교", partRole: "web" },
  { id: "ac-3", nickname: "박하윤", university: "동국대학교", partRole: "web" },
  // SpringBoot (Backend)
  {
    id: "ac-4",
    nickname: "최건우",
    university: "건국대학교",
    partRole: "springboot",
  },
  {
    id: "ac-5",
    nickname: "정다은",
    university: "숙명여자대학교",
    partRole: "springboot",
  },
  // Design
  {
    id: "ac-6",
    nickname: "오지민",
    university: "국민대학교",
    partRole: "design",
  },
  {
    id: "ac-7",
    nickname: "신예은",
    university: "이화여자대학교",
    partRole: "design",
  },
  {
    id: "ac-8",
    nickname: "이방토",
    university: "이화여자대학교",
    partRole: "design",
  },
  {
    id: "ac-9",
    nickname: "이방토토",
    university: "이화여자대학교",
    partRole: "design",
  },
  {
    id: "ac-10",
    nickname: "이방울방울토",
    university: "이화여자대학교",
    partRole: "design",
  },
]

export const MOCK_MATCHING_PARTS: MatchingPartData[] = [
  {
    partName: "Web",
    projects: [
      {
        projectName: "UMC Product",
        challengerName: "김도현",
        challengerUniversity: "인하대학교",
        partRole: "web",
        status: "recruiting",
        currentCount: 4,
        totalCount: 6,
        roleRows: [
          {
            role: "Frontend",
            blocks: [
              filledBlock("이수민", "round1"),
              filledBlock("박지훈", "round2"),
              filledBlock("최서연", "round3"),
              emptyBlock(),
            ],
          },
          {
            role: "Backend",
            blocks: [
              filledBlock("정민준", "round1"),
              filledBlock("한예진", "round2"),
              blockedBlock(),
              blockedBlock(),
            ],
          },
          {
            role: "Design",
            blocks: [
              filledBlock("김하늘", "round1"),
              emptyBlock(),
              blockedBlock(),
              blockedBlock(),
            ],
          },
        ],
      },
      {
        projectName: "커뮤니티 앱",
        challengerName: "이하은",
        challengerUniversity: "서강대학교",
        partRole: "web",
        status: "completed",
        totalCount: 5,
        roleRows: [
          {
            role: "Frontend",
            blocks: [
              filledBlock("김태윤", "round1"),
              filledBlock("오서현", "round1"),
              filledBlock("장우진", "round2"),
              blockedBlock(),
            ],
          },
          {
            role: "Backend",
            blocks: [
              filledBlock("윤채원", "round1"),
              filledBlock("송민재", "round3"),
              blockedBlock(),
              blockedBlock(),
            ],
          },
          {
            role: "Design",
            blocks: [
              filledBlock("조예린", "round2"),
              blockedBlock(),
              blockedBlock(),
              blockedBlock(),
            ],
          },
        ],
      },
    ],
  },
  {
    partName: "Plan",
    projects: [
      {
        projectName: "헬스케어 플랫폼",
        challengerName: "박서준",
        challengerUniversity: "한양대학교",
        partRole: "plan",
        status: "recruiting",
        currentCount: 2,
        totalCount: 3,
        roleRows: [
          {
            role: "Frontend",
            blocks: [
              filledBlock("강지우", "round1"),
              filledBlock("임수빈", "round2"),
              emptyBlock(),
              blockedBlock(),
            ],
          },
          {
            role: "Backend",
            blocks: [
              filledBlock("서도윤", "round1"),
              blockedBlock(),
              blockedBlock(),
              blockedBlock(),
            ],
          },
          {
            role: "Design",
            blocks: [
              emptyBlock(),
              blockedBlock(),
              blockedBlock(),
              blockedBlock(),
            ],
          },
        ],
      },
    ],
  },
  {
    partName: "Design",
    projects: [
      {
        projectName: "쇼핑몰 리뉴얼",
        challengerName: "최유진",
        challengerUniversity: "홍익대학교",
        partRole: "design",
        status: "completed",
        totalCount: 4,
        roleRows: [
          {
            role: "Frontend",
            blocks: [
              filledBlock("나현서", "round1"),
              filledBlock("배준호", "round1"),
              filledBlock("안소희", "round2"),
              filledBlock("류시온", "random"),
            ],
          },
          {
            role: "Backend",
            blocks: [
              filledBlock("권민서", "round1"),
              filledBlock("장현우", "round2"),
              blockedBlock(),
              blockedBlock(),
            ],
          },
          {
            role: "Design",
            blocks: [
              filledBlock("이소율", "round1"),
              blockedBlock(),
              blockedBlock(),
              blockedBlock(),
            ],
          },
        ],
      },
    ],
  },
]
