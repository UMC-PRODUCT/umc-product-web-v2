export function composeRecruitmentTitle(baseTitle: string, footer: string) {
  return footer ? `${baseTitle} ${footer}` : baseTitle
}

// 임시 저장 시 제목이 중복되면 꼬릿말에 숫자를 2부터 붙여 사용 가능한 조합을 찾는다.
// (예: 복제 직후 원본과 제목이 같은 경우)
export function resolveAvailableFooter(
  baseTitle: string,
  footer: string,
  existingTitles: string[],
): { footer: string; wasAdjusted: boolean } {
  if (!existingTitles.includes(composeRecruitmentTitle(baseTitle, footer))) {
    return { footer, wasAdjusted: false }
  }

  let n = 2
  let candidate = footer ? `${footer} ${n}` : `${n}`
  while (
    existingTitles.includes(composeRecruitmentTitle(baseTitle, candidate))
  ) {
    n++
    candidate = footer ? `${footer} ${n}` : `${n}`
  }
  return { footer: candidate, wasAdjusted: true }
}

// 사용자가 직접 입력한 제목이 이미 존재하는지(수정 저장/등록 시 차단용) 확인한다.
export function isRecruitmentTitleTaken(
  baseTitle: string,
  footer: string,
  existingTitles: string[],
  excludeTitle?: string,
) {
  const fullTitle = composeRecruitmentTitle(baseTitle, footer)
  return existingTitles.some(
    (title) => title === fullTitle && title !== excludeTitle,
  )
}

// 전체 진행 기간(서류 모집 시작 ~ 면접 결과 발표) 최대 일수
export const MAX_TOTAL_PERIOD_DAYS = 25

// 서류 접수 기간(시작~종료) 최소/최대 일수. 모집 유형별로 다르다.
export const DOC_PERIOD_DAYS = {
  REGULAR: { min: 3, max: 17 },
  ADDITIONAL: { min: 1, max: 8 },
} as const

// 면접 종료 후 결과 발표까지 허용되는 최대 일수
export const MAX_INTERVIEW_RESULT_DELAY_DAYS = 7

function toDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// start~end를 양끝 포함해서 센 일수 (예: 1/1 ~ 1/3 = 3일)
export function dayCountInclusive(start: Date, end: Date): number {
  const diff = toDateOnly(end).getTime() - toDateOnly(start).getTime()
  return Math.round(diff / 86_400_000) + 1
}

// from에서 to까지 경과한 일수 (예: 1/10 -> 1/17 = 7일)
export function dayGap(from: Date, to: Date): number {
  const diff = toDateOnly(to).getTime() - toDateOnly(from).getTime()
  return Math.round(diff / 86_400_000)
}
