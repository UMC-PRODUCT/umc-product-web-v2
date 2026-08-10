import type { RoleType } from "@/entities/member/model/challenger"

export interface Staff {
  id: string
  nickname: string
  name: string
}

/**
 * 평가 담당자로 배정할 수 있는 사람인지.
 *
 * 회원 검색은 학교의 모든 챌린저를 준다. 한 학교에 수백 명이라 그대로 두면
 * 명단에서 운영진을 찾을 수 없다.
 *
 * 서버는 운영진 기록이 있는 사람에게만 roleTypes 를 채워 준다. 순수 챌린저는
 * 빈 배열로 온다. 서버 역할 enum 에는 챌린저가 아예 없지만, 프론트 타입에는
 * 있어서 혹시 섞여 와도 걸러지도록 함께 본다.
 */
export function isRecruitingStaffRole(
  roleTypes: RoleType[] | undefined,
): boolean {
  return (roleTypes ?? []).some((roleType) => roleType !== "CHALLENGER")
}

export function isStaff(value: unknown): value is Staff {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "nickname" in value &&
    typeof value.nickname === "string" &&
    "name" in value &&
    typeof value.name === "string"
  )
}

export const SCHOOL_STAFF_LIST: Staff[] = [
  { id: "staff-1", nickname: "이삭", name: "강지훈" },
  { id: "staff-2", nickname: "헤일리", name: "한현서" },
  { id: "staff-3", nickname: "주디", name: "양혜원" },
  { id: "staff-4", nickname: "준오", name: "오창준" },
]

export const SCHOOL_STAFF_PANEL_ID = "school-staff-panel"
export const RECRUITMENT_BOX_ID = "regular-recruitment-box"
export const ASSIGNED_STAFF_CHIP_PREFIX = "assigned-staff-"

export function resolveDropTargetId(
  overId: string,
  assignedEvaluators: Staff[],
  staffList: Staff[] = SCHOOL_STAFF_LIST,
): string | null {
  if (overId === RECRUITMENT_BOX_ID) return RECRUITMENT_BOX_ID
  if (overId.startsWith(ASSIGNED_STAFF_CHIP_PREFIX)) return RECRUITMENT_BOX_ID
  if (assignedEvaluators.some((staff) => staff.id === overId)) {
    return RECRUITMENT_BOX_ID
  }

  if (
    overId === SCHOOL_STAFF_PANEL_ID ||
    staffList.some((staff) => staff.id === overId)
  ) {
    return SCHOOL_STAFF_PANEL_ID
  }

  return null
}
