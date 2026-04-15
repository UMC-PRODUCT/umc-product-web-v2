import { z } from "zod"

const THUMBNAIL_ACCEPTED_TYPES = ["image/jpeg", "image/png"]
const LOGO_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/svg+xml"]
const MAX_FILE_SIZE = 10 * 1024 * 1024

export const basicInfoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  thumbnail: z
    .instanceof(File)
    .refine((f) => THUMBNAIL_ACCEPTED_TYPES.includes(f.type))
    .refine((f) => f.size <= MAX_FILE_SIZE),
  logo: z
    .instanceof(File)
    .refine((f) => LOGO_ACCEPTED_TYPES.includes(f.type))
    .refine((f) => f.size <= MAX_FILE_SIZE),
  planningLink: z.string().url(),
})

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>
