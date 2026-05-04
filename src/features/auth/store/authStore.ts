import { create } from "zustand"

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  memberId: number | null
  isAuthed: boolean
  setTokens: (tokens: {
    accessToken: string
    refreshToken: string
    memberId?: number
  }) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
  memberId: null,
  isAuthed: !!localStorage.getItem("access_token"),
  setTokens: ({ accessToken, refreshToken, memberId }) => {
    localStorage.setItem("access_token", accessToken)
    localStorage.setItem("refresh_token", refreshToken)
    set({
      accessToken,
      refreshToken,
      memberId: memberId ?? null,
      isAuthed: true,
    })
  },
  clear: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    set({
      accessToken: null,
      refreshToken: null,
      memberId: null,
      isAuthed: false,
    })
  },
}))
