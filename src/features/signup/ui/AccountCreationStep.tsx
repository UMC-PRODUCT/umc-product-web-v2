import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"

import { getSimpleValidationState, getValidationColor } from "../validation"

interface AccountCreationStepProps {
  id: string
  password: string
  confirmPassword: string
  isIdValid: boolean
  isIdDuplicated: boolean
  isPasswordValid: boolean
  hasInvalidSpecialChar: boolean
  isPasswordMatch: boolean
  onIdChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onIdDuplicateCheck: () => void
}

export function AccountCreationStep({
  id,
  password,
  confirmPassword,
  isIdValid,
  isIdDuplicated,
  isPasswordValid,
  hasInvalidSpecialChar,
  isPasswordMatch,
  onIdChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onIdDuplicateCheck,
}: AccountCreationStepProps) {
  const idValidationState = getSimpleValidationState(id, isIdValid)
  const idValidationColor = getValidationColor(idValidationState)
  const passwordValidationState = hasInvalidSpecialChar
    ? "invalid"
    : getSimpleValidationState(password, isPasswordValid)
  const passwordValidationColor = getValidationColor(passwordValidationState)

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <div>
          <span className="text-body-1-medium text-teal-gray-600">아이디</span>
          <span className="text-body-1-medium text-error-600">*</span>
        </div>

        <form className="flex items-center gap-1.5">
          <InputBox
            value={id}
            onChange={(e) => onIdChange(e.target.value)}
            state={
              isIdDuplicated || (id !== "" && !isIdValid) ? "error" : "default"
            }
            rightAdornment={<></>}
          />
          <Button
            size={"m"}
            color={"primary"}
            variant={"weak"}
            disabled={!isIdValid}
            onClick={onIdDuplicateCheck}
          >
            중복 확인
          </Button>
        </form>

        <div className="flex h-5.5 items-center gap-1">
          {!isIdDuplicated && (
            <>
              <CheckIcon className={`h-4 w-4 ${idValidationColor}`} />
              <p className={`text-body-2-medium ${idValidationColor}`}>
                5~20자의 영문, 숫자와 특수기호(_),(-) 사용 가능
              </p>
            </>
          )}

          {isIdDuplicated && (
            <>
              <CheckIcon className="text-error-500 h-4 w-4" />
              <p className="text-error-500 text-body-2-medium">
                중복된 아이디입니다.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <div>
          <span className="text-body-1-medium text-teal-gray-600">
            비밀번호
          </span>
          <span className="text-body-1-medium text-error-600">*</span>
        </div>

        <InputBox
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          state={
            password !== "" && !isPasswordValid && !hasInvalidSpecialChar
              ? "error"
              : "default"
          }
          className="w-full"
        />

        <div className="flex h-5.5 items-center gap-1">
          <>
            <CheckIcon className={`h-4 w-4 ${passwordValidationColor}`} />
            <p className={`text-body-2-medium ${passwordValidationColor}`}>
              영문, 숫자, 특수문자 중 2종류 이상 포함한 8-16자
            </p>
          </>
        </div>

        {hasInvalidSpecialChar && (
          <div className="flex h-5.5 items-center gap-1">
            <CheckIcon className="text-error-500 h-4 w-4" />
            <p className="text-error-500 text-body-2-medium">
              사용 가능한 특수문자 !#$&*@?
            </p>
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <div>
          <span className="text-body-1-medium text-teal-gray-600">
            비밀번호 확인
          </span>
          <span className="text-body-1-medium text-error-600">*</span>
        </div>

        <InputBox
          type="password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          state={
            confirmPassword !== "" && !isPasswordMatch ? "error" : "default"
          }
          className="w-full"
        />

        {confirmPassword && !isPasswordMatch && (
          <div className="flex h-5.5 items-center gap-1">
            <CheckIcon className="text-error-500 h-4 w-4" />
            <p className="text-error-500 text-body-2-medium">
              비밀번호와 일치하지 않습니다.
            </p>
          </div>
        )}

        {confirmPassword && isPasswordMatch && (
          <div className="flex h-5.5 items-center gap-1">
            <CheckIcon className="text-success-600 h-4 w-4" />
            <p className="text-success-600 text-body-2-medium">비밀번호 일치</p>
          </div>
        )}
      </div>
    </>
  )
}
