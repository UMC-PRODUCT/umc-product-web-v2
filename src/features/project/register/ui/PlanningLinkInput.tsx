import type { FieldError, UseFormRegister } from "react-hook-form"

import type { BasicInfoFormData } from "../model/basicInfoSchema"

interface PlanningLinkInputProps {
  register: UseFormRegister<BasicInfoFormData>
  error: FieldError | undefined
}

export function PlanningLinkInput({ register, error }: PlanningLinkInputProps) {
  return (
    <>
      <label htmlFor="planning-link" className="sr-only">
        기획서 링크
      </label>
      <input
        id="planning-link"
        type="url"
        {...register("planningLink")}
        aria-invalid={!!error}
        className="border-teal-gray-150 text-body-1-regular text-teal-gray-600 aria-invalid:focus:ring-error-500 h-14 w-full overflow-x-auto rounded-[12px] border px-5 py-4 outline-none aria-invalid:focus:ring-2"
        placeholder="Notion, Figma 등 기획안 링크를 입력하세요."
      />
    </>
  )
}
