const LOGIN_RETURN_TO_STORAGE_KEY = "login_return_to"
/**
 * 복귀 경로가 없을 때 로그인 후 착지할 곳.
 *
 * 매칭이 아니라 프로젝트 목록이다. 모집 기간에는 매칭으로 들어갈 수 없어, 기본값을
 * 매칭으로 두면 로그아웃 뒤 다시 로그인한 사람이 매번 막히는 화면으로 떨어진다.
 */
const DEFAULT_LOGIN_SUCCESS_PATH = "/projects"

export function normalizeReturnTo(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return undefined

  try {
    const url = new URL(trimmed, "https://umc.local")
    if (url.origin !== "https://umc.local") return undefined
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return undefined
  }
}

export function buildLoginRedirectSearch(returnTo?: unknown): {
  returnTo?: string
} {
  const normalized = normalizeReturnTo(returnTo)
  return normalized ? { returnTo: normalized } : {}
}

export function rememberLoginReturnTo(returnTo?: unknown): void {
  if (typeof window === "undefined") return
  const normalized = normalizeReturnTo(returnTo)
  if (normalized) {
    sessionStorage.setItem(LOGIN_RETURN_TO_STORAGE_KEY, normalized)
    return
  }
  sessionStorage.removeItem(LOGIN_RETURN_TO_STORAGE_KEY)
}

export function readLoginReturnTo(): string | undefined {
  if (typeof window === "undefined") return undefined
  return normalizeReturnTo(
    sessionStorage.getItem(LOGIN_RETURN_TO_STORAGE_KEY) ?? undefined,
  )
}

export function clearLoginReturnTo(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(LOGIN_RETURN_TO_STORAGE_KEY)
}

export function resolveLoginSuccessPath(returnTo?: unknown): string {
  const normalized = normalizeReturnTo(returnTo)
  const stored = readLoginReturnTo()
  clearLoginReturnTo()
  return normalized ?? stored ?? DEFAULT_LOGIN_SUCCESS_PATH
}

export function getCurrentReturnTo(): string | undefined {
  if (typeof window === "undefined") return undefined
  return normalizeReturnTo(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  )
}
