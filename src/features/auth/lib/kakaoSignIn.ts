export interface KakaoSignInResult {
  accessToken: string
}

export function signInWithKakao(): Promise<KakaoSignInResult> {
  return new Promise((resolve, reject) => {
    const appKey = import.meta.env.VITE_KAKAO_APP_KEY as string | undefined

    if (!appKey) {
      reject(new Error("VITE_KAKAO_APP_KEY가 설정되지 않았습니다."))
      return
    }
    if (!window.Kakao) {
      reject(new Error("Kakao SDK가 로드되지 않았습니다."))
      return
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(appKey)
    }

    window.Kakao.Auth.login({
      success: (authObj) => resolve({ accessToken: authObj.access_token }),
      fail: (err) => reject(err),
      throughTalk: false,
    })
  })
}
