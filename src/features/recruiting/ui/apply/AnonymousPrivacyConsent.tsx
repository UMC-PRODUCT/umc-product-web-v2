import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"

import type { PublicTermResponse } from "@/shared/api/terms"

interface AnonymousPrivacyConsentProps {
  term: PublicTermResponse | undefined
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export function AnonymousPrivacyConsent({
  term,
  checked,
  disabled = false,
  onChange,
}: AnonymousPrivacyConsentProps) {
  return (
    <div className="border-teal-gray-100 flex items-start gap-3 rounded-[12px] border bg-white px-7 py-5">
      <Checkbox
        checked={checked}
        disabled={disabled || !term}
        variant="primary"
        aria-label="개인정보 처리방침 동의"
        onChange={onChange}
      />
      <div className="flex min-w-0 flex-col gap-1">
        <button
          type="button"
          disabled={!term}
          onClick={() => {
            if (term) window.open(term.link, "_blank", "noopener,noreferrer")
          }}
          className="text-body-2-medium text-teal-gray-700 text-left underline underline-offset-2 disabled:no-underline"
        >
          개인정보 처리방침에 동의합니다 (필수)
        </button>
        <p className="text-label-1-medium text-teal-gray-400">
          익명 지원서 작성과 지원 결과 안내를 위해 필요합니다.
        </p>
      </div>
    </div>
  )
}
