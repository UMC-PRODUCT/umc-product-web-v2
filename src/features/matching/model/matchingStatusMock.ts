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

function filledBlock(
  name: string,
  variant: "round1" | "round2" | "round3" | "random",
): MatchingBlockData {
  return variant === "round1"
    ? { type: "round1", name }
    : { type: "filled", name, tagVariant: variant }
}

function emptyBlock(): MatchingBlockData {
  return { type: "none" }
}

function blockedBlock(): MatchingBlockData {
  return { type: "blocked" }
}

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
