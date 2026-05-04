import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import { checkLoginIdAvailability } from "@/features/auth/api/credentials"
import {
  type IdPwCredentialsFormData,
  idPwCredentialsSchema,
} from "@/features/auth/model/registerSchema"
import { useSignupStore } from "@/features/auth/store/signupStore"
import { Button } from "@/shared/ui/Button"

export function SignupStepIdPwCredentials() {
  const { setStep, setCredentials } = useSignupStore()
  const addToast = useToastStore((s) => s.addToast)
  const [isChecking, setIsChecking] = useState(false)
  const [checkedLoginId, setCheckedLoginId] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IdPwCredentialsFormData>({
    resolver: zodResolver(idPwCredentialsSchema),
    mode: "onSubmit",
  })

  const loginId = watch("loginId")

  const handleCheckAvailability = async () => {
    const currentLoginId = loginId?.trim()
    if (!currentLoginId) return
    setIsChecking(true)
    try {
      const res = await checkLoginIdAvailability(currentLoginId)
      setCheckedLoginId(currentLoginId)
      setIsAvailable(res.available)
      addToast({
        message: res.available
          ? `"${currentLoginId}" 사용 가능한 아이디입니다.`
          : `"${currentLoginId}" 이미 사용 중인 아이디입니다.`,
        color: res.available ? "primary" : "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch {
      addToast({
        message: "중복 확인에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsChecking(false)
    }
  }

  const isIdCheckedAndAvailable = isAvailable && checkedLoginId === loginId

  const onSubmit = (data: IdPwCredentialsFormData) => {
    setCredentials({ loginId: data.loginId, rawPassword: data.rawPassword })
    setStep("email")
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-[360px] flex-col gap-6"
    >
      <div className="flex flex-col gap-1">
        <p className="text-heading-3-bold">계정 정보</p>
        <p className="text-label-2-medium text-teal-gray-400">
          로그인에 사용할 아이디와 비밀번호를 입력해주세요.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-label-2-medium">아이디</label>
          <div className="flex gap-2">
            <input
              {...register("loginId")}
              type="text"
              placeholder="아이디를 입력해주세요."
              className="border-teal-gray-200 text-body-2-medium flex-1 rounded-lg border px-4 py-3 outline-none focus:border-teal-600"
            />
            <Button
              type="button"
              variant="weak"
              color="primary"
              size="m"
              onClick={() => void handleCheckAvailability()}
              disabled={!loginId?.trim()}
              isLoading={isChecking}
            >
              중복확인
            </Button>
          </div>
          {errors.loginId && (
            <p className="text-label-2-medium text-red-500">
              {errors.loginId.message}
            </p>
          )}
          {isIdCheckedAndAvailable && (
            <p className="text-label-2-medium text-teal-600">
              사용 가능한 아이디입니다.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label-2-medium">비밀번호</label>
          <input
            {...register("rawPassword")}
            type="password"
            placeholder="비밀번호를 입력해주세요."
            className="border-teal-gray-200 text-body-2-medium w-full rounded-lg border px-4 py-3 outline-none focus:border-teal-600"
          />
          {errors.rawPassword && (
            <p className="text-label-2-medium text-red-500">
              {errors.rawPassword.message}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="fill"
        color="primary"
        className="w-full"
        disabled={!isIdCheckedAndAvailable}
      >
        다음
      </Button>
    </form>
  )
}
