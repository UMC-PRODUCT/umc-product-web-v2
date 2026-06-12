import { create } from "zustand"

export interface ToastItem {
  id: string
  message: string
  color: "primary" | "red"
  variant: "deep" | "weak"
  type: "default" | "time"
  duration: number
  /** 양옆에 표시할 이미지 src (cone 등) */
  sideImage?: string
}

type AddToastOptions = Omit<ToastItem, "id">

interface ToastStore {
  toasts: ToastItem[]
  addToast: (options: AddToastOptions) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (options) =>
    set((state) => ({
      toasts: [...state.toasts, { ...options, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
