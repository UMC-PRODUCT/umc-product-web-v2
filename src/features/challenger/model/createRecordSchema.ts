import { z } from "zod"

const PART_VALUES = [
  "PLAN",
  "DESIGN",
  "WEB",
  "ANDROID",
  "IOS",
  "NODEJS",
  "SPRINGBOOT",
  "ADMIN",
] as const

const ROLE_TYPE_VALUES = [
  "CHALLENGER",
  "SUPER_ADMIN",
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
  "CHAPTER_PRESIDENT",
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
  "SCHOOL_PART_LEADER",
  "SCHOOL_ETC_ADMIN",
] as const

const PART_REQUIRING_ROLES: ReadonlyArray<(typeof ROLE_TYPE_VALUES)[number]> = [
  "CHALLENGER",
  "SCHOOL_PART_LEADER",
]

/**
 * 백엔드는 ID 류를 numeric string 으로 직렬화하므로 폼도 string 으로 다룬다.
 *
 * `part` 는 `challengerRoleType` 가 CHALLENGER / SCHOOL_PART_LEADER 인 경우에만 사용자 입력이 필요하다.
 * 그 외 역할은 폼 제출 시 ADMIN(운영진) 으로 자동 채워지므로 zod 단계에서는 optional 로 둔다.
 */
export const createRecordSchema = z
  .object({
    gisuId: z
      .string({ message: "기수를 선택해주세요." })
      .min(1, "기수를 선택해주세요."),
    chapterId: z
      .string({ message: "지부를 선택해주세요." })
      .min(1, "지부를 선택해주세요."),
    schoolId: z
      .string({ message: "학교를 선택해주세요." })
      .min(1, "학교를 선택해주세요."),
    part: z.enum(PART_VALUES).optional(),
    challengerRoleType: z.enum(ROLE_TYPE_VALUES, {
      message: "역할을 선택해주세요.",
    }),
    memberName: z
      .string()
      .trim()
      .min(1, "이름을 입력해주세요.")
      .max(50, "이름은 50자 이하로 입력해주세요."),
  })
  .superRefine((data, ctx) => {
    if (
      PART_REQUIRING_ROLES.includes(data.challengerRoleType) &&
      data.part === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "파트를 선택해주세요.",
        path: ["part"],
      })
    }
  })

export type CreateRecordFormData = z.infer<typeof createRecordSchema>
