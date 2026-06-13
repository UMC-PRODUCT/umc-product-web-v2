import type { Part } from "@/features/challenger/model/types"

const OTHER_CHALLENGER_PARTS = new Set<Part>([
  "DESIGN",
  "WEB",
  "ANDROID",
  "IOS",
  "NODEJS",
  "SPRINGBOOT",
])

export function isPmPart(part: Part): boolean {
  return part === "PLAN"
}

export function isOtherChallengerPart(part: Part): boolean {
  return OTHER_CHALLENGER_PARTS.has(part)
}
