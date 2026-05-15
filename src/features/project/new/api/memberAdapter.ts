import type { SearchMemberItem } from "@/features/challenger/model/types"
import type { MemberItem } from "@/shared/ui/searchbar/MemberSearchBar"

export function toMemberItem(item: SearchMemberItem): MemberItem {
  return {
    id: item.memberId,
    nickname: item.nickname,
    name: item.name,
    university: item.schoolName,
  }
}

export function memberBriefToItem(brief: {
  memberId?: number
  nickname?: string
  name?: string
  schoolName?: string
}): MemberItem | null {
  if (!brief.memberId) return null
  return {
    id: String(brief.memberId),
    nickname: brief.nickname ?? "",
    name: brief.name ?? "",
    university: brief.schoolName ?? "",
  }
}
