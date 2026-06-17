const APPLE_SDK_URL =
  "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
const GOOGLE_GSI_URL = "https://accounts.google.com/gsi/client"

const SDK_READY_TIMEOUT_MS = 5000

const pendingLoads = new Map<string, Promise<void>>()

function waitUntilReady(
  isReady: () => boolean,
  timeoutMs: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isReady()) {
      resolve()
      return
    }
    let elapsed = 0
    const interval = setInterval(() => {
      if (isReady()) {
        clearInterval(interval)
        resolve()
        return
      }
      elapsed += 50
      if (elapsed >= timeoutMs) {
        clearInterval(interval)
        reject(new Error("SDK 초기화 시간이 초과되었습니다."))
      }
    }, 50)
  })
}

function loadScriptOnce(src: string, isReady: () => boolean): Promise<void> {
  if (isReady()) return Promise.resolve()

  const existing = pendingLoads.get(src)
  if (existing) return existing

  const load = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = src
    script.async = true
    script.onload = () => {
      waitUntilReady(isReady, SDK_READY_TIMEOUT_MS).then(resolve, reject)
    }
    script.onerror = () => {
      reject(new Error(`SDK 스크립트 로드에 실패했습니다: ${src}`))
    }
    document.head.appendChild(script)
  }).catch((error: unknown) => {
    pendingLoads.delete(src)
    throw error
  })

  pendingLoads.set(src, load)
  return load
}

export function loadKakaoSdk(): Promise<void> {
  return loadScriptOnce(KAKAO_SDK_URL, () => Boolean(window.Kakao))
}

export function loadGoogleGsi(): Promise<void> {
  return loadScriptOnce(GOOGLE_GSI_URL, () =>
    Boolean(window.google?.accounts?.oauth2),
  )
}

export function loadAppleSdk(): Promise<void> {
  return loadScriptOnce(APPLE_SDK_URL, () => Boolean(window.AppleID?.auth))
}
