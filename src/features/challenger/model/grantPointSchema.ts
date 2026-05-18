import { z } from "zod"

const POINT_TYPE_VALUES = [
  "BEST_WORKBOOK",
  "WARNING",
  "OUT",
  "CUSTOM",
  "BLOG_CHALLENGE",
  "BEST_WORKBOOK_V2",
  "UMC_EVENT_REVIEW",
  "PEER_REVIEW_SUBMISSION",
  "NO_WORKBOOK_MISSION",
  "STUDY_LATE",
  "STUDY_ABSENT",
  "EVENT_LATE",
  "EVENT_EARLY_LEAVE",
  "EVENT_LATE_CANCEL",
  "EVENT_NO_SHOW",
  "PART_LEAD_FEEDBACK_LATE",
  "SCHOOL_CORE_MEETING_ABSENT",
  "SCHOOL_CORE_TASK_NOT_COMPLETED",
] as const

/**
 * 가이드 문서 A-4 기준:
 * - `pointType`: 필수
 * - `pointValue`: optional. null/undefined 면 PointType 의 기본 점수 사용.
 *   단, `CUSTOM` 은 기본 점수 0 이라 명시 입력을 강제한다.
 * - `description`: 필수 (부여 사유)
 */
export const grantPointSchema = z
  .object({
    pointType: z.enum(POINT_TYPE_VALUES, {
      message: "상벌점 유형을 선택해주세요.",
    }),
    pointValue: z
      .number({ message: "점수를 숫자로 입력해 주세요." })
      .int("정수만 입력할 수 있습니다.")
      .optional(),
    description: z
      .string({ message: "부여 사유를 입력해 주세요." })
      .trim()
      .min(1, "부여 사유를 입력해 주세요.")
      .max(200, "사유는 200자 이하로 입력해 주세요."),
  })
  .superRefine((data, ctx) => {
    if (data.pointType === "CUSTOM" && data.pointValue === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "기타 유형은 점수를 직접 입력해야 합니다.",
        path: ["pointValue"],
      })
    }
  })

export type GrantPointFormData = z.infer<typeof grantPointSchema>
