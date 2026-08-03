import { isAxiosError } from "axios"

interface ServerErrorBody {
  success?: boolean
  code?: string
  message?: string
}

function getErrorBody(error: unknown): ServerErrorBody | undefined {
  if (!isAxiosError(error)) return undefined
  const body = error.response?.data as ServerErrorBody | undefined
  if (!body || typeof body !== "object") return undefined
  return body
}

// 서버가 success: false 로 응답한 경우. axios 인터셉터가 이 응답을 reject 로
// 바꾸기 때문에 HTTP 상태가 200 이어도 여기로 온다.
// 권한 부족처럼 원인이 확정된 실패라 재시도해도 결과가 같다.
export function isServerRejection(error: unknown): boolean {
  return getErrorBody(error)?.success === false
}

// 서버 메시지는 사용자에게 보여줄 수 있는 한국어 문장이다
// (예: RECRUITING-0323 "해당 기수의 지원 현황을 조회할 권한이 없어요.").
// 권한 체계가 아직 바뀌는 중이라 코드 목록을 프론트에 복제하지 않는다.
export function getServerErrorMessage(error: unknown): string | undefined {
  const message = getErrorBody(error)?.message
  return message && message.trim() !== "" ? message : undefined
}

// 파일 다운로드는 responseType: "blob" 이라 실패 응답 본문도 Blob 으로 온다. Blob 도
// typeof 는 "object" 라 getServerErrorMessage 의 검사는 통과하지만 message 가 없어
// 항상 undefined 가 된다. 그래서 "조건을 좁혀 달라" 같은 안내가 통째로 묻힌다.
export async function getServerErrorMessageFromBlob(
  error: unknown,
): Promise<string | undefined> {
  if (!isAxiosError(error)) return undefined
  const body = error.response?.data
  if (!(body instanceof Blob)) return getServerErrorMessage(error)

  try {
    const parsed = JSON.parse(await body.text()) as ServerErrorBody
    const message = parsed?.message
    return message && message.trim() !== "" ? message : undefined
  } catch {
    // CSV 본문이 그대로 실린 경우처럼 JSON 이 아닐 수 있다. 호출부가 기본 문구를 쓴다.
    return undefined
  }
}
