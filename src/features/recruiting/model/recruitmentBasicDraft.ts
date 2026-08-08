import type { RecruitmentBasicInfo } from "./useRecruitmentCreateStore"

const STORAGE_KEY_PREFIX = "umc:recruiting:create:basic-draft:"

export interface RecruitmentBasicDraft {
  basicInfo: RecruitmentBasicInfo
  savedAt: string
}

function storageKey(memberId: string): string {
  return `${STORAGE_KEY_PREFIX}${memberId}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function recruitmentBasicInfoSnapshot(
  basicInfo: RecruitmentBasicInfo,
): string {
  return JSON.stringify(basicInfo)
}

export function readRecruitmentBasicDraft(
  memberId: string,
): RecruitmentBasicDraft | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(storageKey(memberId))
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (
      !isRecord(parsed) ||
      !isRecord(parsed.basicInfo) ||
      typeof parsed.savedAt !== "string"
    ) {
      return null
    }

    return {
      basicInfo: parsed.basicInfo as unknown as RecruitmentBasicInfo,
      savedAt: parsed.savedAt,
    }
  } catch {
    return null
  }
}

export function writeRecruitmentBasicDraft(
  memberId: string,
  basicInfo: RecruitmentBasicInfo,
): void {
  if (typeof window === "undefined") return

  try {
    const draft: RecruitmentBasicDraft = {
      basicInfo,
      savedAt: new Date().toISOString(),
    }
    window.localStorage.setItem(storageKey(memberId), JSON.stringify(draft))
  } catch {
    return
  }
}

export function clearRecruitmentBasicDraft(memberId: string): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.removeItem(storageKey(memberId))
  } catch {
    return
  }
}
