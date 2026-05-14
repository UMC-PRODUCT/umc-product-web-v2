import { Controller, useFormContext } from "react-hook-form"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { InputBox } from "@/shared/ui/input/InputBox"

import {
  getSimpleValidationState,
  getValidationColor,
  type SignUpFormData,
} from "../validation"
import { type School, SchoolDropdown } from "./SchoolDropdown"

export function ProfileInfoStep() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<SignUpFormData>()

  const name = watch("name")
  const nickname = watch("nickname")

  const isNicknameValid = !errors.nickname
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

        <Controller
          name="school"
          control={control}
          render={({ field }) => (
            <SchoolDropdown
              value={(field.value as School) || undefined}
              onChange={field.onChange}
              className="w-full"
            />
          )}
        />
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <div>
          <span className="text-body-1-medium text-teal-gray-600">이름</span>
          <span className="text-body-1-medium text-error-600">*</span>
        </div>

        <InputBox
          {...register("name")}
          type="default"
          value={name}
          className="w-full"
        />
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <div>
          <span className="text-body-1-medium text-teal-gray-600">닉네임</span>
          <span className="text-body-1-medium text-error-600">*</span>
        </div>

        <InputBox
          {...register("nickname")}
          type="default"
          value={nickname}
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
