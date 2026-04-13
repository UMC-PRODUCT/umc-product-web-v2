import { z } from "zod"

const ACCEPTED_TYPES = ["image/jpeg", "image/png"]
const MAX_FILE_SIZE = 10 * 1024 * 1024

export const basicInfoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  thumbnail: z
    .instanceof(File)
    .refine((f) => ACCEPTED_TYPES.includes(f.type))
    .refine((f) => f.size <= MAX_FILE_SIZE),
  planningLink: z.string().url(),
})

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>
