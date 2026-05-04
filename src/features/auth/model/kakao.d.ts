interface KakaoAuthObject {
  access_token: string
  token_type: string
  refresh_token?: string
  expires_in: number
  scope?: string
}

interface KakaoAuthLoginOptions {
  success: (authObj: KakaoAuthObject) => void
  fail: (err: unknown) => void
  throughTalk?: boolean
}

interface Window {
  Kakao?: {
    init: (appKey: string) => void
    isInitialized: () => boolean
    Auth: {
      login: (options: KakaoAuthLoginOptions) => void
    }
  }
}
