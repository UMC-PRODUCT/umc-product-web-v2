import { clearLoginReturnTo } from "@/features/auth/lib/loginRedirect"
import { useAuthStore } from "@/features/auth/store/authStore"

export function logout() {
  clearLoginReturnTo()
  useAuthStore.getState().clear()
  window.location.href = "/login"
}
