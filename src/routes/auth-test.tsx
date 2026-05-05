import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { getMyInfo, type MemberInfoResponse } from "@/features/auth/api/me"
import { logout } from "@/features/auth/lib/logout"
import { useAuthStore } from "@/features/auth/store/authStore"
import { Button } from "@/shared/ui/Button"

export const Route = createFileRoute("/auth-test")({
  component: AuthTestPage,
})

function maskToken(token: string | null) {
  if (!token) return "(없음)"
  return `${token.slice(0, 12)}...${token.slice(-6)}`
}

function AuthTestPage() {
  const { isAuthed, memberId, accessToken, refreshToken } = useAuthStore()
  const [memberInfo, setMemberInfo] = useState<MemberInfoResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFetchMe = async () => {
    setIsLoading(true)
    setError(null)
    setMemberInfo(null)
    try {
      const info = await getMyInfo()
      setMemberInfo(info)
    } catch (e) {
      setError(e instanceof Error ? e.message : "요청 실패")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4">
      <div className="w-full max-w-[480px] rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3">
        <p className="text-label-2-medium text-yellow-700">
          임시 디버그 페이지 — 인증 흐름 확인용. 디자인 확정 시 제거 예정
        </p>
      </div>

      <div className="border-teal-gray-200 flex w-full max-w-[480px] flex-col gap-4 rounded-xl border p-6">
        <p className="text-heading-3-bold">인증 상태</p>
        <table className="text-body-2-medium w-full">
          <tbody>
            <tr>
              <td className="text-teal-gray-400 py-1 pr-4">isAuthed</td>
              <td
                className={
                  isAuthed
                    ? "font-semibold text-teal-600"
                    : "font-semibold text-red-500"
                }
              >
                {String(isAuthed)}
              </td>
            </tr>
            <tr>
              <td className="text-teal-gray-400 py-1 pr-4">memberId</td>
              <td>{memberId ?? "(없음)"}</td>
            </tr>
            <tr>
              <td className="text-teal-gray-400 py-1 pr-4">access_token</td>
              <td className="font-mono text-xs break-all">
                {maskToken(accessToken)}
              </td>
            </tr>
            <tr>
              <td className="text-teal-gray-400 py-1 pr-4">refresh_token</td>
              <td className="font-mono text-xs break-all">
                {maskToken(refreshToken)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex w-full max-w-[480px] flex-col gap-3">
        <Button
          variant="fill"
          color="primary"
          className="w-full"
          isLoading={isLoading}
          onClick={handleFetchMe}
        >
          내 정보 불러오기 (GET /v1/member/me)
        </Button>
        <Button
          variant="weak"
          color="neutral"
          className="w-full"
          onClick={logout}
        >
          로그아웃
        </Button>
      </div>

      {memberInfo && (
        <div className="border-teal-gray-200 w-full max-w-[480px] rounded-xl border p-4">
          <p className="text-label-2-medium text-teal-gray-400 mb-2">
            응답 결과
          </p>
          <pre className="overflow-auto text-xs">
            {JSON.stringify(memberInfo, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="w-full max-w-[480px] rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-label-2-medium text-red-500">에러: {error}</p>
        </div>
      )}
    </main>
  )
}
