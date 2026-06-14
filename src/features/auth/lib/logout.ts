import { useAuthStore } from "@/features/auth/store/authStore"

export function logout() {
  useAuthStore.getState().clear()
  window.location.href = "/login"
}
