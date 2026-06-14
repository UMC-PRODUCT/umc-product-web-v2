import { create } from "zustand"

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  memberId: number | null
  isAuthed: boolean
  setTokens: (
    tokens: {
      accessToken: string
      refreshToken: string
      memberId?: number
    },
    remember?: boolean,
  ) => void
  clear: () => void
}

const readToken = (key: string) => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(key) || sessionStorage.getItem(key)
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: readToken("access_token"),
  refreshToken: readToken("refresh_token"),
  memberId: null,
  isAuthed: !!readToken("access_token"),
  setTokens: ({ accessToken, refreshToken, memberId }, remember) => {
    let useLocalStorage = true
    if (remember !== undefined) {
      useLocalStorage = remember
    } else if (typeof window !== "undefined") {
      if (localStorage.getItem("access_token")) {
        useLocalStorage = true
      } else if (sessionStorage.getItem("access_token")) {
        useLocalStorage = false
      }
    }

    if (typeof window !== "undefined") {
      if (useLocalStorage) {
        localStorage.setItem("access_token", accessToken)
        localStorage.setItem("refresh_token", refreshToken)
        sessionStorage.removeItem("access_token")
        sessionStorage.removeItem("refresh_token")
      } else {
        sessionStorage.setItem("access_token", accessToken)
        sessionStorage.setItem("refresh_token", refreshToken)
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
    }

    set({
      accessToken,
      refreshToken,
      memberId: memberId ?? null,
      isAuthed: true,
    })
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      sessionStorage.removeItem("access_token")
      sessionStorage.removeItem("refresh_token")
    }
    set({
      accessToken: null,
      refreshToken: null,
      memberId: null,
      isAuthed: false,
    })
  },
}))
