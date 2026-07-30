import { isAxiosError } from "axios"

// RECRUITING-ADMIN-013(모집 차수 생성) 백엔드 에러 코드 → 사용자 안내 문구.
const ROUND_CREATE_ERROR_MESSAGES: Record<string, string> = {
  RECRUITING_SEASON_NOT_FOUND: "시즌 정보를 찾을 수 없습니다.",
  RECRUITING_ROUND_INVALID_ROUND_NO: "차수 값이 올바르지 않습니다.",
  RECRUITING_ROUND_NO_SEQUENCE_CONFLICT:
    "추가 모집 차수는 바로 다음 번호로만 만들 수 있습니다.",
  RECRUITING_ROUND_ALREADY_EXISTS: "이미 동일한 차수가 존재합니다.",
  RECRUITING_ROUND_TITLE_ALREADY_EXISTS:
    "이미 같은 공고 제목이 있어 등록할 수 없습니다.",
  RECRUITING_ROUND_TRACK_NOT_IN_SEASON:
    "선택한 트랙이 이 시즌의 모집 대상이 아닙니다.",
  RECRUITING_ROUND_INVALID_TITLE: "공고 제목을 확인해 주세요.",
}

export function getRecruitingRoundCreateErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { code?: string; message?: string }
      | undefined
    if (data?.code && ROUND_CREATE_ERROR_MESSAGES[data.code]) {
      return ROUND_CREATE_ERROR_MESSAGES[data.code]
    }
    if (data?.message) return data.message
  }
  return "모집 차수 생성에 실패했습니다."
}
