import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Chrome, MessageCircle } from "lucide-react"
import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  changePassword,
  checkLoginIdAvailability,
  loginWithIdPw,
  registerCredentials,
} from "@/features/auth/api/credentials"
import { loginWithApple } from "@/features/auth/api/socialLogin"
import {
  isApplePopupCancelled,
  signInWithApple,
} from "@/features/auth/lib/appleSignIn"
import { handleLoginResponse } from "@/features/auth/lib/handleLoginResponse"
import { redirectToOAuth } from "@/features/auth/lib/oauthRedirect"
import { useAuthStore } from "@/features/auth/store/authStore"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { Button } from "@/shared/ui/Button"

export const Route = createFileRoute("/test/login")({
  component: LoginPage,
})

function LoginPage() {
  const addToast = useToastStore((s) => s.addToast)
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const setTokens = useAuthStore((s) => s.setTokens)
  const clearAuth = useAuthStore((s) => s.clear)
  const navigate = useNavigate()

  const showToast = (message: string, color: "primary" | "red" = "primary") => {
    addToast({
      message,
      color,
      variant: "deep",
      type: "default",
      duration: 3000,
    })
  }

  const handleAppleSignIn = async () => {
    try {
      const { authorizationCode } = await signInWithApple()
      const res = await loginWithApple({ authorizationCode })
      const result = handleLoginResponse(res)
      if (result === "LOGIN_SUCCESS") {
        void navigate({ to: "/" })
      } else {
        void navigate({ to: "/signup" })
      }
    } catch (error) {
      if (isApplePopupCancelled(error)) return
      showToast("Apple 로그인에 실패했습니다. 다시 시도해주세요.", "red")
    }
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-10 px-4 py-10">
      <div className="flex flex-col items-center gap-3">
        <UmcLogo className="h-8 w-auto text-teal-600" />
        <p className="text-heading-2-bold text-teal-gray-900">
          로그인 / 회원가입
        </p>
        <p className="text-label-2-medium text-teal-gray-400">
          임시 페이지 — 디자인 확정 후 교체 예정
        </p>
      </div>

      <div className="flex w-full max-w-90 flex-col gap-3">
        <Button
          variant="weak"
          color="neutral"
          size="xl"
          className="w-full"
          onClick={() => redirectToOAuth("GOOGLE")}
        >
          <span className="flex items-center gap-2">
            <Chrome size={20} />
            Google로 시작하기
          </span>
        </Button>
        <Button
          variant="weak"
          color="neutral"
          size="xl"
          className="w-full"
          onClick={() => redirectToOAuth("KAKAO")}
        >
          <span className="flex items-center gap-2">
            <MessageCircle size={20} />
            Kakao로 시작하기
          </span>
        </Button>
        <Button
          variant="weak"
          color="neutral"
          size="xl"
          className="w-full"
          onClick={() => void handleAppleSignIn()}
        >
          <span className="flex items-center gap-2">
            <AppleIcon size={20} />
            Apple로 시작하기
          </span>
        </Button>
      </div>

      <div className="flex w-full max-w-90 items-center gap-3">
        <span className="bg-teal-gray-200 h-px flex-1" />
        <span className="text-label-2-medium text-teal-gray-400">또는</span>
        <span className="bg-teal-gray-200 h-px flex-1" />
      </div>

      <IdPwLoginSection
        onSuccess={(memberId, accessToken, refreshToken) => {
          setTokens({ memberId, accessToken, refreshToken })
          showToast(`ID/PW 로그인 성공 (memberId: ${memberId})`, "primary")
        }}
        onError={(message) => showToast(message, "red")}
      />

      {isAuthed && (
        <section className="flex w-full max-w-90 flex-col gap-6 border-t pt-8">
          <p className="text-subtitle-3-semibold text-teal-gray-800">
            인증된 사용자 도구
          </p>

          <LoginIdAvailabilitySection
            onResult={(loginId, available) =>
              showToast(
                `${loginId}: ${available ? "사용 가능" : "사용 불가"}`,
                available ? "primary" : "red",
              )
            }
            onError={(message) => showToast(message, "red")}
          />

          <RegisterCredentialsSection
            onSuccess={() => showToast("자격증명 등록 성공", "primary")}
            onError={(message) => showToast(message, "red")}
          />

          <ChangePasswordSection
            onSuccess={() => showToast("비밀번호 변경 성공", "primary")}
            onError={(message) => showToast(message, "red")}
          />

          <Button
            variant="weak"
            color="neutral"
            size="m"
            className="w-full"
            onClick={() => {
              clearAuth()
              showToast("로그아웃 완료")
            }}
          >
            로그아웃
          </Button>
        </section>
      )}
    </main>
  )
}

interface IdPwLoginSectionProps {
  onSuccess: (
    memberId: number,
    accessToken: string,
    refreshToken: string,
  ) => void
  onError: (message: string) => void
}

function IdPwLoginSection({ onSuccess, onError }: IdPwLoginSectionProps) {
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginId || !password) return
    setIsLoading(true)
    try {
      const res = await loginWithIdPw({ loginId, password })
      onSuccess(res.memberId, res.accessToken, res.refreshToken)
      setPassword("")
    } catch (error) {
      onError(extractErrorMessage(error, "ID/PW 로그인에 실패했습니다."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex w-full max-w-90 flex-col gap-3"
    >
      <p className="text-label-1-semibold text-teal-gray-700">ID/PW 로그인</p>
      <input
        type="text"
        placeholder="loginId"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
        className="border-teal-gray-200 text-body-2-medium rounded-md border px-3 py-2 outline-none focus:border-teal-500"
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border-teal-gray-200 text-body-2-medium rounded-md border px-3 py-2 outline-none focus:border-teal-500"
      />
      <Button
        type="submit"
        variant="fill"
        color="primary"
        size="m"
        className="w-full"
        disabled={!loginId || !password}
        isLoading={isLoading}
      >
        로그인
      </Button>
      <p className="text-label-2-medium text-teal-gray-400 text-center">
        계정이 없으신가요?{" "}
        <Link
          to="/test/signup/id-pw"
          className="text-teal-600 underline underline-offset-2"
        >
          회원가입
        </Link>
      </p>
    </form>
  )
}

interface LoginIdAvailabilitySectionProps {
  onResult: (loginId: string, available: boolean) => void
  onError: (message: string) => void
}

function LoginIdAvailabilitySection({
  onResult,
  onError,
}: LoginIdAvailabilitySectionProps) {
  const [loginId, setLoginId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCheck = async () => {
    if (!loginId) return
    setIsLoading(true)
    try {
      const res = await checkLoginIdAvailability(loginId)
      onResult(res.loginId, res.available)
    } catch (error) {
      onError(extractErrorMessage(error, "ID 가용성 확인에 실패했습니다."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-label-1-semibold text-teal-gray-700">
        로그인 ID 가용성 확인
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="loginId"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          className="border-teal-gray-200 text-body-2-medium flex-1 rounded-md border px-3 py-2 outline-none focus:border-teal-500"
        />
        <Button
          type="button"
          variant="weak"
          color="primary"
          size="m"
          onClick={() => void handleCheck()}
          disabled={!loginId}
          isLoading={isLoading}
        >
          확인
        </Button>
      </div>
    </div>
  )
}

interface RegisterCredentialsSectionProps {
  onSuccess: () => void
  onError: (message: string) => void
}

function RegisterCredentialsSection({
  onSuccess,
  onError,
}: RegisterCredentialsSectionProps) {
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginId || !password) return
    setIsLoading(true)
    try {
      await registerCredentials({ loginId, password })
      onSuccess()
      setLoginId("")
      setPassword("")
    } catch (error) {
      onError(extractErrorMessage(error, "자격증명 등록에 실패했습니다."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex w-full flex-col gap-2"
    >
      <p className="text-label-1-semibold text-teal-gray-700">
        자격증명 최초 등록
      </p>
      <input
        type="text"
        placeholder="loginId"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
        className="border-teal-gray-200 text-body-2-medium rounded-md border px-3 py-2 outline-none focus:border-teal-500"
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border-teal-gray-200 text-body-2-medium rounded-md border px-3 py-2 outline-none focus:border-teal-500"
      />
      <Button
        type="submit"
        variant="weak"
        color="primary"
        size="m"
        className="w-full"
        disabled={!loginId || !password}
        isLoading={isLoading}
      >
        등록
      </Button>
    </form>
  )
}

interface ChangePasswordSectionProps {
  onSuccess: () => void
  onError: (message: string) => void
}

function ChangePasswordSection({
  onSuccess,
  onError,
}: ChangePasswordSectionProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) return
    setIsLoading(true)
    try {
      await changePassword({ currentPassword, newPassword })
      onSuccess()
      setCurrentPassword("")
      setNewPassword("")
    } catch (error) {
      onError(extractErrorMessage(error, "비밀번호 변경에 실패했습니다."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex w-full flex-col gap-2"
    >
      <p className="text-label-1-semibold text-teal-gray-700">비밀번호 변경</p>
      <input
        type="password"
        placeholder="currentPassword"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="border-teal-gray-200 text-body-2-medium rounded-md border px-3 py-2 outline-none focus:border-teal-500"
      />
      <input
        type="password"
        placeholder="newPassword"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="border-teal-gray-200 text-body-2-medium rounded-md border px-3 py-2 outline-none focus:border-teal-500"
      />
      <Button
        type="submit"
        variant="weak"
        color="primary"
        size="m"
        className="w-full"
        disabled={!currentPassword || !newPassword}
        isLoading={isLoading}
      >
        변경
      </Button>
    </form>
  )
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } })
      .response === "object"
  ) {
    const message = (error as { response?: { data?: { message?: string } } })
      .response?.data?.message
    if (message) return message
  }
  return fallback
}

function AppleIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}
