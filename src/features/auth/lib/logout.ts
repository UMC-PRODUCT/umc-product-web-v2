import { useAuthStore } from "@/entities/member/store/authStore"
import { clearLoginReturnTo } from "@/features/auth/lib/loginRedirect"

export function logout() {
  clearLoginReturnTo()
  useAuthStore.getState().clear()
  window.location.href = "/login"
}
