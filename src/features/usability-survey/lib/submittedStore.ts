const STORAGE_KEY = "usability-survey:submitted-templates"

function readSubmitted(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is number => typeof id === "number")
  } catch {
    return []
  }
}

export function hasSubmittedTemplate(templateId: number): boolean {
  return readSubmitted().includes(templateId)
}

export function markTemplateSubmitted(templateId: number): void {
  try {
    const submitted = readSubmitted()
    if (submitted.includes(templateId)) return
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...submitted, templateId]),
    )
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) 시 무시
  }
}
