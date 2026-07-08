const LOGIN_RETURN_TO_STORAGE_KEY = "login_return_to"
const DEFAULT_LOGIN_SUCCESS_PATH = "/matching/projects"

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
