import { useFormContext } from "react-hook-form"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"

import { type SignUpFormData } from "../validation"

export function TermsAgreementStep() {
  const { watch, setValue } = useFormContext<SignUpFormData>()
  const nickname = watch("nickname")
  const name = watch("name")
  const school = watch("school")

  const serviceAgreement = watch("serviceAgreement")
  const privacyAgreement = watch("privacyAgreement")
  const optionalAgreement = watch("optionalAgreement")

  const allAgreed = serviceAgreement && privacyAgreement && optionalAgreement

  const handleAgreeAll = (checked: boolean) => {
    setValue("serviceAgreement", checked)
    setValue("privacyAgreement", checked)
    setValue("optionalAgreement", checked)
  }

  const toggleAgreement = (
    key: "serviceAgreement" | "privacyAgreement" | "optionalAgreement",
  ) => {
    setValue(key, !watch(key))
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
          onClick={() => toggleAgreement("serviceAgreement")}
          className="flex items-center gap-2 text-left"
        >
          <CheckIcon
            className={`h-6 w-6 ${serviceAgreement ? "text-teal-500" : "text-teal-200"}`}
          />
          <span className="text-body-1-regular text-teal-gray-500">
            (필수) 서비스 이용약관 동의
          </span>
        </button>
        <button
          type="button"
          onClick={() => toggleAgreement("privacyAgreement")}
          className="flex items-center gap-2 text-left"
        >
          <CheckIcon
            className={`h-6 w-6 ${privacyAgreement ? "text-teal-500" : "text-teal-200"}`}
          />
          <span className="text-body-1-regular text-teal-gray-500">
            (필수) 개인정보 처리 방침 동의
          </span>
        </button>
        <button
          type="button"
          onClick={() => toggleAgreement("optionalAgreement")}
          className="flex items-center gap-2 text-left"
        >
          <CheckIcon
            className={`h-6 w-6 ${optionalAgreement ? "text-teal-500" : "text-teal-200"}`}
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
