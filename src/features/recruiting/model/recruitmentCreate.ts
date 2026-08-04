import type { RecruitmentRoundType } from "./recruitmentList"

export type PeriodFieldKey =
  | "documentStartAt"
  | "documentEndAt"
  | "documentResultPublishedAt"
  | "interviewStartAt"
  | "interviewEndAt"
  | "finalResultPublishedAt"

export interface PeriodFieldValue {
  date: string
  time: string
}

export const INITIAL_PERIOD_FORM: Record<PeriodFieldKey, PeriodFieldValue> = {
  documentStartAt: { date: "", time: "00:00" },
  documentEndAt: { date: "", time: "23:59" },
  documentResultPublishedAt: { date: "", time: "00:00" },
  interviewStartAt: { date: "", time: "00:00" },
  interviewEndAt: { date: "", time: "23:59" },
  finalResultPublishedAt: { date: "", time: "12:00" },
}

// 정규 모집은 항상 1차 고정이라 제목엔 차수 표기 안 함
// (다른 화면에서도 정규 모집은 차수 없이 '정규'로만 노출)
export function buildRecruitmentPreviewTitle({
  school,
  recruitmentType,
  roundNo,
  gisuGeneration,
}: {
  school: string | undefined
  recruitmentType: RecruitmentRoundType | undefined
  roundNo: string | undefined
  gisuGeneration: number | null | undefined
}): string {
  return `${school ?? "전체 학교"} UMC ${gisuGeneration ?? "-"}기 ${
    recruitmentType === "ADDITIONAL" && roundNo ? `${roundNo}차 ` : ""
  }${
    recruitmentType === "ADDITIONAL"
      ? "추가 모집"
      : recruitmentType === "REGULAR"
        ? "정규 모집"
        : "모집"
  }`
}

// periodForm의 {date: "YYYY-MM-DD", time: "HH:mm"}을 백엔드가 요구하는
// Instant(ISO 8601, UTC) 문자열로 변환한다.
export function periodFieldToInstant(value: PeriodFieldValue): string {
  return new Date(`${value.date}T${value.time}:00`).toISOString()
}

export function composeRecruitmentTitle(baseTitle: string, footer: string) {
  return footer ? `${baseTitle} ${footer}` : baseTitle
}

export const MAX_TITLE_LENGTH = 10000
// 임시 저장/다음 진행 시 제목이 이미 사용 중이면 꼬릿말에 숫자를 2부터 붙여 사용 가능한 조합을 찾는다.
// 실제 중복 여부는 백엔드(title-availability API)에 묻는다.
export async function resolveAvailableFooter(
  baseTitle: string,
  footer: string,
  checkAvailable: (title: string) => Promise<boolean>,
): Promise<{ footer: string; wasAdjusted: boolean }> {
  if (await checkAvailable(composeRecruitmentTitle(baseTitle, footer))) {
    return { footer, wasAdjusted: false }
  }

  let n = 2
  let candidate = footer ? `${footer} ${n}` : `${n}`
  while (
    !(await checkAvailable(composeRecruitmentTitle(baseTitle, candidate)))
  ) {
    n++
    candidate = footer ? `${footer} ${n}` : `${n}`
  }
  return { footer: candidate, wasAdjusted: true }
}

// 복제(clone) 등 base/footer 구분 없이 제목 하나만 다루는 곳에서 쓴다.
// 이미 사용 중이면 뒤에 숫자를 2부터 붙여 사용 가능한 제목을 찾는다.
export async function resolveAvailableTitle(
  baseTitle: string,
  checkAvailable: (title: string) => Promise<boolean>,
): Promise<string> {
  if (await checkAvailable(baseTitle)) return baseTitle

  let n = 2
  while (!(await checkAvailable(`${baseTitle} ${n}`))) {
    n++
  }
  return `${baseTitle} ${n}`
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
