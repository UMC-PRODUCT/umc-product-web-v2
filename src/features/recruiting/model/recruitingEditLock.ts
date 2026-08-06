/**
 * 리크루팅 화면의 편집 잠금 판정.
 *
 * 권한은 시즌(학교×기수) 단위라 역할 타입으로 흉내 내면 서버가 허용하는 범위와
 * 어긋난다. 그래서 서버 권한 조회 결과(permittedSeasonIds)를 그대로 기준으로 쓴다.
 * 평가 화면의 잠금 패턴(사유 코드 + 문구 맵)을 따른다.
 */
export type EditLockReason = "permissionLoading" | "noEditPermission"

export const EDIT_LOCK_MESSAGE: Record<EditLockReason, string> = {
  permissionLoading: "권한을 확인하는 중입니다.",
  noEditPermission: "이 시즌을 수정할 권한이 없어 읽기 전용으로 표시됩니다.",
}

export interface EditEligibility {
  canEdit: boolean
  reason: EditLockReason | null
}

const EDITABLE: EditEligibility = { canEdit: true, reason: null }

/**
 * 특정 시즌을 편집할 수 있는지.
 * 권한 조회가 끝나기 전에는 잠가 둔다. 열어 두면 못 고칠 값을 고치게 되고
 * 저장 시점에야 거부당한다.
 */
export function resolveSeasonEditEligibility(
  seasonId: string | null | undefined,
  permittedSeasonIds: ReadonlySet<string>,
  isPermissionLoading: boolean,
): EditEligibility {
  if (isPermissionLoading) {
    return { canEdit: false, reason: "permissionLoading" }
  }
  if (!seasonId || !permittedSeasonIds.has(String(seasonId))) {
    return { canEdit: false, reason: "noEditPermission" }
  }
  return EDITABLE
}

/** 화면에 보이는 시즌 중 하나라도 편집 가능한지. 저장 버튼 노출에 쓴다. */
export function hasAnyEditableSeason(
  seasonIds: readonly (string | null | undefined)[],
  permittedSeasonIds: ReadonlySet<string>,
): boolean {
  return seasonIds.some(
    (id) => id != null && permittedSeasonIds.has(String(id)),
  )
}
