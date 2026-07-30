export interface Staff {
  id: string
  nickname: string
  name: string
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
): string | null {
  if (overId === RECRUITMENT_BOX_ID) return RECRUITMENT_BOX_ID
  if (overId.startsWith(ASSIGNED_STAFF_CHIP_PREFIX)) return RECRUITMENT_BOX_ID
  if (assignedEvaluators.some((staff) => staff.id === overId)) {
    return RECRUITMENT_BOX_ID
  }

  if (
    overId === SCHOOL_STAFF_PANEL_ID ||
    SCHOOL_STAFF_LIST.some((staff) => staff.id === overId)
  ) {
    return SCHOOL_STAFF_PANEL_ID
  }

  return null
}
