import { create } from "zustand"

export type SignupMode = "oauth" | "id-pw"
export type SignupStep = "credentials" | "email" | "basic-info" | "terms"

interface SignupState {
  mode: SignupMode
  step: SignupStep
  oAuthVerificationToken: string
  loginId: string
  rawPassword: string
  emailVerificationId: number | null
  emailVerificationToken: string
  name: string
  nickname: string
  schoolId: number | null
  setStep: (step: SignupStep) => void
  setEmailVerificationId: (id: number) => void
  setEmailVerificationToken: (token: string) => void
  setBasicInfo: (data: {
    name: string
    nickname: string
    schoolId: number
  }) => void
  setCredentials: (data: { loginId: string; rawPassword: string }) => void
  init: (oAuthVerificationToken: string) => void
  initIdPw: () => void
  reset: () => void
}

const initialState = {
  mode: "oauth" as SignupMode,
  step: "email" as SignupStep,
  oAuthVerificationToken: "",
  loginId: "",
  rawPassword: "",
  emailVerificationId: null,
  emailVerificationToken: "",
  name: "",
  nickname: "",
  schoolId: null,
}

export const useSignupStore = create<SignupState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setEmailVerificationId: (id) => set({ emailVerificationId: id }),
  setEmailVerificationToken: (token) => set({ emailVerificationToken: token }),
  setBasicInfo: (data) =>
    set({ name: data.name, nickname: data.nickname, schoolId: data.schoolId }),
  setCredentials: (data) =>
    set({ loginId: data.loginId, rawPassword: data.rawPassword }),
  init: (oAuthVerificationToken) =>
    set({
      ...initialState,
      mode: "oauth",
      step: "email",
      oAuthVerificationToken,
    }),
  initIdPw: () =>
    set({
      ...initialState,
      mode: "id-pw",
      step: "credentials",
    }),
  reset: () => set(initialState),
}))
