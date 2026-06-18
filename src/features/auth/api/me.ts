import { api } from "@/shared/lib/axios"

import type {
  ChallengerInfoResponse,
  ChallengerPointInfo,
  ChallengerRoleResponse,
  ChallengerStatus,
  Part,
  RoleType,
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

type LegacyChallengerRecord = Omit<
  ChallengerInfoResponse,
  "challengerStatus"
> & {
  challengerStatus?: ChallengerStatus | null
}

type LegacyRoleResponse = Omit<ChallengerRoleResponse, "challengerRoleId"> & {
  challengerRoleId?: string | number
  id?: string | number
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
  challengerRecords?: LegacyChallengerRecord[]
  roles?: LegacyRoleResponse[]
  [key: string]: unknown
}

function toStringId(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return ""
}

function getLatestRecord(
  records: ChallengerInfoResponse[],
): ChallengerInfoResponse | undefined {
  return [...records].sort((a, b) => {
    const generationDiff = Number(b.gisu) - Number(a.gisu)
    if (Number.isFinite(generationDiff) && generationDiff !== 0) {
      return generationDiff
    }
    return Number(b.gisuId) - Number(a.gisuId)
  })[0]
}

function normalizeChallengerStatus(
  status: ChallengerStatus | null | undefined,
): ChallengerStatus {
  return status ?? "ACTIVE"
}

function normalizeChallengerRecords(
  raw: MemberInfoV2Raw,
): ChallengerInfoResponse[] {
  if (raw.challengerHistory?.length) {
    return raw.challengerHistory.map((h) => ({
      ...(h as unknown as ChallengerInfoResponse),
      challengerId: String(h.challengerId),
      gisuId: String(h.gisuId),
      gisu: String(h.generation),
      chapterId: String(h.chapterId),
      memberId: "",
      name: "",
      nickname: "",
      email: null,
      schoolId: "",
      schoolName: "",
    }))
  }

  return (raw.challengerRecords ?? []).map((record) => ({
    ...record,
    challengerId: toStringId(record.challengerId),
    memberId: toStringId(record.memberId),
    gisuId: toStringId(record.gisuId),
    gisu: toStringId(record.gisu),
    chapterId: toStringId(record.chapterId),
    schoolId: toStringId(record.schoolId),
    challengerStatus: normalizeChallengerStatus(record.challengerStatus),
  }))
}

function normalizeCurrentGisuMemberInfo(
  raw: MemberInfoV2Raw,
  records: ChallengerInfoResponse[],
): CurrentGisuMemberInfo | null {
  if (raw.currentGisuMemberInfo) {
    return {
      ...raw.currentGisuMemberInfo,
      gisuId: String(raw.currentGisuMemberInfo.gisuId),
      generation: String(raw.currentGisuMemberInfo.generation),
      challenger: raw.currentGisuMemberInfo.challenger
        ? {
            ...raw.currentGisuMemberInfo.challenger,
            challengerId: String(
              raw.currentGisuMemberInfo.challenger.challengerId,
            ),
            part: raw.currentGisuMemberInfo.challenger.part,
          }
        : null,
    }
  }

  const currentRecord = getLatestRecord(records)
  if (!currentRecord) return null

  const roleTypes = (raw.roles ?? [])
    .filter((role) => role.gisuId === currentRecord.gisuId)
    .map((role) => role.roleType)

  return {
    gisuId: currentRecord.gisuId,
    generation: currentRecord.gisu,
    challenger: {
      challengerId: currentRecord.challengerId,
      part: currentRecord.part,
      challengerStatus: normalizeChallengerStatus(
        currentRecord.challengerStatus,
      ),
    },
    isAdmin: roleTypes.some((roleType) => roleType !== "CHALLENGER"),
    roleTypes,
  }
}

function normalizeRoles(
  raw: MemberInfoV2Raw,
  currentGisu: CurrentGisuMemberInfo | null,
  records: ChallengerInfoResponse[],
): ChallengerRoleResponse[] {
  if (raw.roles?.length) {
    return raw.roles.map((role) => ({
      ...role,
      challengerRoleId: toStringId(role.challengerRoleId ?? role.id),
      challengerId: toStringId(role.challengerId),
      organizationId: toStringId(role.organizationId),
      gisuId: toStringId(role.gisuId),
      gisu: toStringId(role.gisu),
    }))
  }

  const currentHistory = records.find((h) => h.gisuId === currentGisu?.gisuId)

  return (currentGisu?.roleTypes ?? []).map((rt) => ({
    roleType: rt as RoleType,
    organizationId: String(currentHistory?.chapterId ?? ""),
    challengerRoleId: "",
    challengerId: String(currentHistory?.challengerId ?? ""),
    organizationType: "CHAPTER",
    gisuId: String(currentGisu?.gisuId ?? ""),
    gisu: String(currentGisu?.generation ?? ""),
  }))
}

export function normalizeMemberInfo(raw: MemberInfoV2Raw): MemberInfoResponse {
  const challengerRecords = normalizeChallengerRecords(raw)
  const currentGisuMemberInfo = normalizeCurrentGisuMemberInfo(
    raw,
    challengerRecords,
  )
  const roles = normalizeRoles(raw, currentGisuMemberInfo, challengerRecords)

  return {
    ...(raw as unknown as MemberInfoResponse),
    currentGisuMemberInfo,
    challengerRecords,
    roles,
  }
}

export async function getMyInfo(): Promise<MemberInfoResponse> {
  const { data } = await api.get<ApiResponse<MemberInfoV2Raw>>("/v2/member/me")
  return normalizeMemberInfo(data.result)
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
