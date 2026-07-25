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
    "nickname" in value &&
    "name" in value
  )
}

export const SCHOOL_STAFF_LIST: Staff[] = [
  { id: "staff-1", nickname: "이삭", name: "강지훈" },
  { id: "staff-2", nickname: "헤일리", name: "한현서" },
  { id: "staff-3", nickname: "주디", name: "양혜원" },
  { id: "staff-4", nickname: "준오", name: "오창준" },
]
