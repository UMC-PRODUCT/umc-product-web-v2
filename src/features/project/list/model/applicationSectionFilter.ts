import type { Section } from "@/features/project/new/model/applicationQuestion"

const PART_TO_SECTION_ID: Record<string, string> = {
  DESIGN: "design",
  WEB: "frontend",
  IOS: "frontend",
  ANDROID: "frontend",
  SPRINGBOOT: "backend",
  NODEJS: "backend",
}

export function filterApplicationSectionsByPart(
  sections: Section[],
  part: string | undefined,
): Section[] {
  const targetSectionId = part ? PART_TO_SECTION_ID[part] : undefined
  if (!targetSectionId) return sections

  return sections.filter(
    (section) => section.id === "common" || section.id === targetSectionId,
  )
}
