import { api } from "@/shared/lib/axios"

import type {
  ChallengerInfoResponse,
  ChallengerPointInfo,
  ChallengerRoleResponse,
  Part,
} from "@/features/challenger/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export interface MemberProfileInfo {
  id: string | null
  linkedIn: string | null
  instagram: string | null
  github: string | null
  blog: string | null
  personal: string | null
}

export interface CurrentGisuMemberInfo {
  gisuId: string
  generation: string
  challenger?: {
    challengerId: string
    part: Part
    challengerStatus: string
  } | null
  isAdmin?: boolean
  roleTypes?: string[]
}

export interface MemberInfoResponse {
  id: string
  name: string
  nickname: string
  email: string
  schoolId: string
  schoolName: string
  profileImageLink: string | null
  status: "ACTIVE" | "INACTIVE" | "WITHDRAWN"
  hasLocalCredential: boolean
  profile?: MemberProfileInfo | null
  totalActivityDays?: string
  currentGisuMemberInfo?: CurrentGisuMemberInfo | null
  roles: ChallengerRoleResponse[]
  challengerRecords?: ChallengerInfoResponse[]
}

interface V2HistoryItem {
  challengerId: string
  gisuId: string
  generation: string
  chapterId: string
  chapterName: string
  part: string
  challengerStatus: string
  points?: ChallengerPointInfo[]
  totalPoints?: string
  roleTypes?: string[]
  [key: string]: unknown
}

interface MemberInfoV2Raw {
  hasLocalCredential?: boolean
  profile?: MemberProfileInfo | null
  totalActivityDays?: string
  challengerHistory?: V2HistoryItem[]
  currentGisuMemberInfo?: {
    gisuId: string
    generation: string
    challenger?: {
      challengerId: string
      part: Part
      challengerStatus: string
    } | null
    isAdmin?: boolean
    roleTypes?: string[]
  } | null
  [key: string]: unknown
}

export async function getMyInfo(): Promise<MemberInfoResponse> {
  const { data } = await api.get<ApiResponse<MemberInfoV2Raw>>("/v2/member/me")
  const raw = data.result
  const history = raw.challengerHistory ?? []
  const currentGisu = raw.currentGisuMemberInfo

  // 현재 기수 history 항목 → CHAPTER_PRESIDENT의 organizationId(chapterId) 추출용
  const currentHistory = history.find((h) => h.gisuId === currentGisu?.gisuId)

  const challengerRecords: ChallengerInfoResponse[] = history.map((h) => ({
    ...(h as unknown as ChallengerInfoResponse),
    challengerId: String(h.challengerId),
    gisuId: String(h.gisuId),
    gisu: String(h.generation), // generation(기수 번호) → gisu(표시용)
    chapterId: String(h.chapterId),
    memberId: "",
    name: "",
    nickname: "",
    email: null,
    schoolId: "",
    schoolName: "",
  }))

  // 현재 기수 roleTypes 기준, chapterId를 organizationId로 사용
  const roles: ChallengerRoleResponse[] = (currentGisu?.roleTypes ?? []).map(
    (rt) => ({
      roleType: rt as ChallengerRoleResponse["roleType"],
      organizationId: String(currentHistory?.chapterId ?? ""),
      challengerRoleId: "",
      challengerId: String(currentHistory?.challengerId ?? ""),
      organizationType: "CHAPTER" as ChallengerRoleResponse["organizationType"],
      gisuId: String(currentGisu?.gisuId ?? ""),
      gisu: String(currentGisu?.generation ?? ""),
    }),
  )

  const result: MemberInfoResponse = {
    ...(raw as unknown as MemberInfoResponse),
    currentGisuMemberInfo: currentGisu
      ? {
          ...currentGisu,
          gisuId: String(currentGisu.gisuId),
          generation: String(currentGisu.generation),
          challenger: currentGisu.challenger
            ? {
                ...currentGisu.challenger,
                challengerId: String(currentGisu.challenger.challengerId),
                part: currentGisu.challenger.part,
              }
            : null,
        }
      : null,
    challengerRecords,
    roles,
  }

  return result
}

export async function updateMemberInfo(body: {
  profileImageId?: string
}): Promise<MemberInfoResponse> {
  const { data } = await api.patch<ApiResponse<MemberInfoResponse>>(
    "/v1/member",
    body,
  )
  return data.result
}

// TODO: API CI 반영 후 확인 필요
export async function changeEmail(body: {
  newEmail: string
  emailVerificationToken: string
}): Promise<void> {
  await api.patch("/v1/member/email", body)
}

export interface DeleteMemberRequest {
  googleAccessToken?: string
  kakaoAccessToken?: string
}

export async function deleteMember(
  body: DeleteMemberRequest = {},
): Promise<MemberInfoResponse> {
  const { data } = await api.delete<ApiResponse<MemberInfoResponse>>(
    "/v1/member",
    { data: body },
  )
  return data.result
}
