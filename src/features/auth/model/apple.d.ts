interface AppleIDAuthorizationResponse {
  authorization: {
    code: string
    id_token: string
    state?: string
  }
  user?: {
    email?: string
    name?: {
      firstName?: string
      lastName?: string
    }
  }
}

interface AppleIDAuthConfig {
  clientId: string
  scope: string
  redirectURI: string
  state?: string
  usePopup?: boolean
}

interface AppleIDAuth {
  init: (config: AppleIDAuthConfig) => void
  signIn: () => Promise<AppleIDAuthorizationResponse>
}

interface Window {
  AppleID?: {
    auth: AppleIDAuth
  }
}
