import { useAuthStore } from "@/entities/member/store/authStore"
import { clearLoginReturnTo } from "@/shared/lib/loginRedirect"
import { useSelectedGisuStore } from "@/shared/model/useSelectedGisuStore"

export function logout() {
  clearLoginReturnTo()
  useAuthStore.getState().clear()
  useSelectedGisuStore.getState().clear()
  window.location.href = "/login"
}
