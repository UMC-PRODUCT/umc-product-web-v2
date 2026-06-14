import { useFormContext } from "react-hook-form"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { InputBox } from "@/shared/ui/input/InputBox"

import {
  getSimpleValidationState,
  getValidationColor,
  type SignUpFormData,
} from "../validation"

export function AccountCreationStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SignUpFormData>()

  const email = watch("email")
  const password = watch("password")
  const confirmPassword = watch("confirmPassword")

  const isPasswordValid = !errors.password
  const isPasswordMatch = password !== "" && password === confirmPassword
  const hasInvalidSpecialChar =
    !!errors.password?.message?.includes("사용 가능한 특수문자")

  const passwordValidationState = hasInvalidSpecialChar
    ? "invalid"
    : getSimpleValidationState(password, isPasswordValid)
  const passwordValidationColor = getValidationColor(passwordValidationState)

  return (
    <>
      <div className="flex min-w-90 flex-col gap-1.5">
        <div>
          <span className="text-body-1-medium text-teal-gray-600">
            이메일 아이디
          </span>
          <span className="text-body-1-medium text-error-600">*</span>
        </div>

        <div className="flex items-center gap-1.5">
          <InputBox
            value={email ?? ""}
            onChange={() => {}}
            state="disabled"
            rightAdornment={<></>}
            className="w-full"
          />
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
          {...register("password")}
          type="password"
          value={password}
          state={
            password !== "" && !isPasswordValid && !hasInvalidSpecialChar
              ? "error"
              : "default"
          }
          className="w-full"
        />

        <div className="flex h-5.5 items-center gap-1">
          <CheckIcon className={`h-4 w-4 ${passwordValidationColor}`} />
          <p className={`text-body-2-medium ${passwordValidationColor}`}>
            영문, 숫자, 특수문자 중 2종류 이상 포함한 8-16자
          </p>
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
          {...register("confirmPassword")}
          type="password"
          value={confirmPassword}
          state={
            confirmPassword !== "" && !isPasswordMatch ? "error" : "default"
          }
          className="w-full"
        />

        <div className="flex h-5.5 items-center gap-1">
          {confirmPassword && !isPasswordMatch && (
            <>
              <CheckIcon className="text-error-500 h-4 w-4" />
              <p className="text-error-500 text-body-2-medium">
                비밀번호와 일치하지 않습니다.
              </p>
            </>
          )}

          {confirmPassword && isPasswordMatch && (
            <>
              <CheckIcon className="text-success-600 h-4 w-4" />
              <p className="text-success-600 text-body-2-medium">
                비밀번호 일치
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
