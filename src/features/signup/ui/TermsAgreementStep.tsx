import { useFormContext } from "react-hook-form"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"

import { type SignUpFormData } from "../validation"

import type { Term, TermType } from "@/features/auth/model/types"

const TERM_TITLE_MAP: Record<TermType, string> = {
  SERVICE: "서비스 이용약관 동의",
  PRIVACY: "개인정보 처리 방침 동의",
  MARKETING: "마케팅 정보 수신 동의",
  LOCATION: "위치정보 이용약관 동의",
}

const getTermTitle = (type: TermType, fallback: string): string => {
  return TERM_TITLE_MAP[type] || fallback || "이용약관 동의"
}

interface TermsAgreementStepProps {
  terms: Term[]
  isLoading: boolean
}

export function TermsAgreementStep({
  terms,
  isLoading,
}: TermsAgreementStepProps) {
  const { watch, setValue } = useFormContext<SignUpFormData>()
  const nickname = watch("nickname")
  const name = watch("name")
  const school = watch("school")

  const termsAgreements = watch("termsAgreements") || {}

  const allAgreed =
    terms.length > 0 && terms.every((term) => !!termsAgreements[term.id])

  const handleAgreeAll = (checked: boolean) => {
    const updated = { ...termsAgreements }
    terms.forEach((term) => {
      updated[term.id] = checked
    })
    setValue("termsAgreements", updated, { shouldValidate: true })
  }

  const toggleAgreement = (termId: number) => {
    setValue(
      "termsAgreements",
      {
        ...termsAgreements,
        [termId]: !termsAgreements[termId],
      },
      { shouldValidate: true },
    )
  }

  return (
    <div className="flex w-full flex-col gap-8.5">
      <div className="flex h-14 w-90 items-center justify-center gap-2 rounded-[12px] bg-teal-100">
        <span className="text-subtitle-1-semibold text-teal-500">
          {`${nickname}/${name}`}
        </span>
        <span className="text-subtitle-1-medium text-teal-gray-400">
          {school}
        </span>
      </div>

      <div className="flex w-full flex-col gap-4">
        <div className="flex h-[27px] items-center gap-3.5">
          <Checkbox
            checked={allAgreed}
            onChange={handleAgreeAll}
            variant="primary"
          />

          <span className="text-subtitle-2-medium text-teal-gray-900">
            모두 동의합니다.
          </span>
        </div>

        <div className="bg-teal-gray-200 h-[1px] w-full rounded-[0.5px]" />

        {isLoading ? (
          <p className="text-body-2-medium text-teal-gray-400 py-4 text-center">
            약관을 불러오는 중입니다...
          </p>
        ) : (
          terms.map((term) => {
            const isAgreed = !!termsAgreements[term.id]
            const requiredText = term.isMandatory ? "(필수)" : "(선택)"
            const title = getTermTitle(term.type, term.typeDescription)

            return (
              <div key={term.id} className="flex items-center gap-2 text-left">
                <button
                  type="button"
                  onClick={() => toggleAgreement(term.id)}
                  className="flex items-center justify-center"
                >
                  <CheckIcon
                    className={`h-6 w-6 ${isAgreed ? "text-teal-500" : "text-teal-200"}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => window.open(term.link, "_blank")}
                  className="text-left"
                >
                  <span className="text-body-1-regular text-teal-gray-500">
                    {`${requiredText} ${title}`}
                  </span>
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
