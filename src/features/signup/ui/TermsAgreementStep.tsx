import { useState } from "react"
import { useFormContext } from "react-hook-form"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"

import { type SignUpFormData } from "../validation"

export function TermsAgreementStep() {
  const { watch } = useFormContext<SignUpFormData>()
  const nickname = watch("nickname")
  const name = watch("name")
  const school = watch("school")

  const [agreements, setAgreements] = useState({
    service: false,
    privacy: false,
    optional: false,
  })

  const allAgreed =
    agreements.service && agreements.privacy && agreements.optional

  const handleAgreeAll = (checked: boolean) => {
    setAgreements({
      service: checked,
      privacy: checked,
      optional: checked,
    })
  }

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
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
        <button
          type="button"
          onClick={() => toggleAgreement("service")}
          className="flex items-center gap-2 text-left"
        >
          <CheckIcon
            className={agreements.service ? "text-teal-500" : "text-teal-200"}
          />
          <span className="text-body-1-regular text-teal-gray-500">
            (필수) 서비스 이용약관 동의
          </span>
        </button>
        <button
          type="button"
          onClick={() => toggleAgreement("privacy")}
          className="flex items-center gap-2 text-left"
        >
          <CheckIcon
            className={agreements.privacy ? "text-teal-500" : "text-teal-200"}
          />
          <span className="text-body-1-regular text-teal-gray-500">
            (필수) 개인정보 처리 방침 동의
          </span>
        </button>
        <button
          type="button"
          onClick={() => toggleAgreement("optional")}
          className="flex items-center gap-2 text-left"
        >
          <CheckIcon
            className={agreements.optional ? "text-teal-500" : "text-teal-200"}
          />
          <span className="text-body-1-regular text-teal-gray-500">
            (선택) 서비스 이용약관 동의
          </span>
        </button>
        <div className="flex w-full flex-col gap-3.5"></div>
      </div>
    </div>
  )
}
