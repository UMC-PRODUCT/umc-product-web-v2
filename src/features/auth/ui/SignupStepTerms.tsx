import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { registerMemberByOAuth } from "@/features/auth/api/register"
import { getTermsByType } from "@/features/auth/api/terms"
import { useSignupStore } from "@/features/auth/store/signupStore"
import { Button } from "@/shared/ui/Button"

import type {
  TermConsentStatus,
  TermResponse,
  TermType,
} from "@/features/auth/model/types"

const REQUIRED_TERM_TYPES = ["SERVICE", "PRIVACY"] as const
const OPTIONAL_TERM_TYPES = ["MARKETING", "LOCATION"] as const
const TERM_LABELS: Record<string, string> = {
  SERVICE: "서비스 이용약관 (필수)",
  PRIVACY: "개인정보 처리방침 (필수)",
  MARKETING: "마케팅 정보 수신 동의 (선택)",
  LOCATION: "위치 기반 서비스 이용 동의 (선택)",
}

interface TermItem {
  type: string
  term: TermResponse
  agreed: boolean
}

export function SignupStepTerms() {
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)
  const {
    oAuthVerificationToken,
    emailVerificationToken,
    name,
    nickname,
    schoolId,
    reset,
  } = useSignupStore()
  const [termItems, setTermItems] = useState<TermItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const allTypes = [...REQUIRED_TERM_TYPES, ...OPTIONAL_TERM_TYPES]
    Promise.allSettled(
      allTypes.map((t) =>
        getTermsByType(t).then((term) => ({ type: t, term })),
      ),
    ).then((results) => {
      const items = results
        .filter(
          (
            r,
          ): r is PromiseFulfilledResult<{
            type: TermType
            term: TermResponse
          }> => r.status === "fulfilled",
        )
        .map(({ value }) => ({ ...value, agreed: false }))
      setTermItems(items)
    })
  }, [])

  const toggle = (id: number) => {
    setTermItems((prev) =>
      prev.map((item) =>
        item.term.id === id ? { ...item, agreed: !item.agreed } : item,
      ),
    )
  }

  const toggleAll = (checked: boolean) => {
    setTermItems((prev) => prev.map((item) => ({ ...item, agreed: checked })))
  }

  const requiredItems = termItems.filter((item) =>
    (REQUIRED_TERM_TYPES as readonly string[]).includes(item.type),
  )
  const allRequiredAgreed =
    requiredItems.length > 0 && requiredItems.every((item) => item.agreed)
  const allAgreed =
    termItems.length > 0 && termItems.every((item) => item.agreed)

  const handleSubmit = async () => {
    if (!allRequiredAgreed) {
      addToast({
        message: "필수 약관에 모두 동의해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }
    if (!schoolId) return

    const termsAgreements: TermConsentStatus[] = termItems.map((item) => ({
      termsId: item.term.id,
      isAgreed: item.agreed,
    }))

    setIsSubmitting(true)
    try {
      const res = await registerMemberByOAuth({
        oAuthVerificationToken,
        emailVerificationToken,
        name,
        nickname,
        schoolId,
        termsAgreements,
      })
      localStorage.setItem("access_token", res.accessToken)
      localStorage.setItem("refresh_token", res.refreshToken)
      sessionStorage.removeItem("oauth_verification_token")
      sessionStorage.removeItem("oauth_provider")
      reset()
      void navigate({
        to: "/matching",
        search: { chapter: "Chromium", page: 1 },
      })
    } catch {
      addToast({
        message: "회원가입에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full max-w-[360px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-heading-3-bold">약관 동의</p>
        <p className="text-label-2-medium text-teal-gray-400">
          서비스 이용을 위한 약관에 동의해주세요.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => toggleAll(!allAgreed)}
          className="border-teal-gray-200 flex items-center gap-3 rounded-lg border px-4 py-3"
        >
          <span
            className={`h-5 w-5 rounded-full border-2 ${allAgreed ? "border-teal-600 bg-teal-600" : "border-teal-gray-300"} flex items-center justify-center`}
          >
            {allAgreed && <span className="h-2 w-2 rounded-full bg-white" />}
          </span>
          <span className="text-body-2-medium font-semibold">전체 동의</span>
        </button>

        <div className="flex flex-col gap-2">
          {termItems.map((item) => (
            <div
              key={item.term.id}
              className="flex items-center justify-between px-1"
            >
              <button
                type="button"
                onClick={() => toggle(item.term.id)}
                className="flex items-center gap-3"
              >
                <span
                  className={`h-5 w-5 rounded-full border-2 ${item.agreed ? "border-teal-600 bg-teal-600" : "border-teal-gray-300"} flex items-center justify-center`}
                >
                  {item.agreed && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-body-2-medium">
                  {TERM_LABELS[item.type] ?? item.type}
                </span>
              </button>
              {item.term.link && (
                <a
                  href={item.term.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-label-2-medium text-teal-gray-400 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  보기
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="fill"
        color="primary"
        className="w-full"
        disabled={!allRequiredAgreed}
        isLoading={isSubmitting}
        onClick={handleSubmit}
      >
        회원가입 완료
      </Button>
    </div>
  )
}
