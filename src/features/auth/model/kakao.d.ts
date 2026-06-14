interface KakaoAuthAuthorizeOptions {
  redirectUri: string
  state?: string
  scope?: string
  prompt?: string
}

interface Window {
  Kakao?: {
    init: (appKey: string) => void
    isInitialized: () => boolean
    Auth: {
      authorize: (options: KakaoAuthAuthorizeOptions) => void
    }
  }
}
