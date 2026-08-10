export interface ApplyDraftRef {
  applicationId: string
  applicationKey: string
}

// 로그인 사용자가 자기 초안을 서버에서 되찾을 경로가 없다(익명 조회는 익명
// 지원서만 준다). applicationId 는 생성 응답에만 나오므로 브라우저에 남긴다.
// 기수·차수와 회원을 키에 함께 넣어 공용 기기에서 계정이 섞이지 않게 한다.
function storageKey(roundId: string, memberId: string) {
  return `umc:recruiting:draft:${roundId}:${memberId}`
}

function isDraftRef(value: unknown): value is ApplyDraftRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "applicationId" in value &&
    typeof (value as ApplyDraftRef).applicationId === "string" &&
    (value as ApplyDraftRef).applicationId.length > 0 &&
    "applicationKey" in value &&
    typeof (value as ApplyDraftRef).applicationKey === "string"
  )
}

export function readApplyDraft(
  roundId: string,
  memberId: string,
): ApplyDraftRef | null {
  try {
    const raw = localStorage.getItem(storageKey(roundId, memberId))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isDraftRef(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeApplyDraft(
  roundId: string,
  memberId: string,
  draft: ApplyDraftRef,
): void {
  try {
    localStorage.setItem(storageKey(roundId, memberId), JSON.stringify(draft))
  } catch {
    // 사생활 보호 모드처럼 저장이 막힌 환경에서도 작성 자체는 이어갈 수 있어야 한다.
  }
}

export function clearApplyDraft(roundId: string, memberId: string): void {
  try {
    localStorage.removeItem(storageKey(roundId, memberId))
  } catch {
    // 위와 같다.
  }
}
