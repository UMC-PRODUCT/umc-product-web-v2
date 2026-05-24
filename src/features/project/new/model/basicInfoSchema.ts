import { z } from "zod"

const THUMBNAIL_ACCEPTED_TYPES = ["image/jpeg", "image/png"]
const LOGO_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/svg+xml"]
const MAX_FILE_SIZE = 10 * 1024 * 1024

export const basicInfoSchema = z.object({
  title: z.string().min(1).max(16),
  description: z.string().min(1).max(200),
  thumbnail: z
    .instanceof(File)
    .superRefine((v, ctx) => {
      if (!THUMBNAIL_ACCEPTED_TYPES.includes(v.type)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom })
      }
      if (v.size > MAX_FILE_SIZE) {
        ctx.addIssue({ code: z.ZodIssueCode.custom })
      }
    })
    .optional(),
  logo: z
    .instanceof(File)
    .superRefine((v, ctx) => {
      if (!LOGO_ACCEPTED_TYPES.includes(v.type)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom })
      }
      if (v.size > MAX_FILE_SIZE) {
        ctx.addIssue({ code: z.ZodIssueCode.custom })
      }
    })
    .optional(),
})

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>
