import { clearLoginReturnTo } from "@/features/auth/lib/loginRedirect"
import { useAuthStore } from "@/features/auth/store/authStore"
import { useCacheStore } from "@/shared/store/cacheStore"

export function logout() {
  clearLoginReturnTo()
  useAuthStore.getState().clear()
  useCacheStore.getState().clear()
  window.location.href = "/login"
}
