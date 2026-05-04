import { create } from "zustand"

export type SignupStep = "email" | "basic-info" | "terms"

interface SignupState {
  step: SignupStep
  oAuthVerificationToken: string
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
  init: (oAuthVerificationToken: string) => void
  reset: () => void
}

const initialState = {
  step: "email" as SignupStep,
  oAuthVerificationToken: "",
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
  init: (oAuthVerificationToken) =>
    set({ ...initialState, oAuthVerificationToken }),
  reset: () => set(initialState),
}))
