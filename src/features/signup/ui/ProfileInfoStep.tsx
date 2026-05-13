import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { InputBox } from "@/shared/ui/input/InputBox"

import { getSimpleValidationState, getValidationColor } from "../validation"
import { type School, SchoolDropdown } from "./SchoolDropdown"

interface ProfileInfoStepProps {
  school: School | undefined
  name: string
  nickname: string
  isNicknameValid: boolean
  onSchoolChange: (school: School) => void
  onNameChange: (value: string) => void
  onNicknameChange: (value: string) => void
}

export function ProfileInfoStep({
  school,
  name,
  nickname,
  isNicknameValid,
  onSchoolChange,
  onNameChange,
  onNicknameChange,
}: ProfileInfoStepProps) {
  const nicknameValidationState = getSimpleValidationState(
    nickname,
    isNicknameValid,
  )
  const nicknameValidationColor = getValidationColor(nicknameValidationState)

  return (
    <>
      <div className="flex w-full flex-col gap-1.5">
        <div>
          <span className="text-body-1-medium text-teal-gray-600">학교</span>
          <span className="text-body-1-medium text-error-600">*</span>
        </div>

        {/* TODO: 학교 목록 API 연동 예정 */}
        <SchoolDropdown
          value={school}
          onChange={onSchoolChange}
          className="w-full"
        />
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <div>
          <span className="text-body-1-medium text-teal-gray-600">이름</span>
          <span className="text-body-1-medium text-error-600">*</span>
        </div>

        <InputBox
          type="default"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <div>
          <span className="text-body-1-medium text-teal-gray-600">닉네임</span>
          <span className="text-body-1-medium text-error-600">*</span>
        </div>

        <InputBox
          type="default"
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          state={nickname !== "" && !isNicknameValid ? "error" : "default"}
          className="w-full"
        />

        <div className="flex h-5.5 items-center gap-1">
          <CheckIcon className={`h-4 w-4 ${nicknameValidationColor}`} />
          <p className={`text-body-2-medium ${nicknameValidationColor}`}>
            공백 없이 한글 1-5자
          </p>
        </div>
      </div>
    </>
  )
}
