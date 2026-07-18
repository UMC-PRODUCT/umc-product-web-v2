export const APPLICANT_COLUMNS = {
  appliedAt: "flex min-w-36 flex-1 items-center justify-center px-4",
  applicant: "flex min-w-27.5 flex-1 items-center px-5",
  chapter: "flex min-w-30 flex-1 items-center px-4",
  school: "flex min-w-30 flex-1 items-center px-4",
  type: "flex min-w-21.5 shrink-0 items-center justify-center px-2.5",
  parts: "flex min-w-50 flex-1 items-center gap-2 px-4",
  progress: "flex min-w-35 flex-1 items-center gap-2.5 px-4",
  result: "flex min-w-22.5 flex-1 items-center px-4",
} as const

export type ApplicantColumnKey = keyof typeof APPLICANT_COLUMNS
