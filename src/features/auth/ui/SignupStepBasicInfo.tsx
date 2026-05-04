import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import { getAllSchools } from "@/features/auth/api/school"
import {
  type BasicInfoFormData,
  basicInfoSchema,
} from "@/features/auth/model/registerSchema"
import { useSignupStore } from "@/features/auth/store/signupStore"
import { Button } from "@/shared/ui/Button"

import type { SchoolNameItem } from "@/features/auth/model/types"

export function SignupStepBasicInfo() {
  const { setStep, setBasicInfo } = useSignupStore()
  const addToast = useToastStore((s) => s.addToast)
  const [schools, setSchools] = useState<SchoolNameItem[]>([])

  useEffect(() => {
    getAllSchools()
      .then((res) => setSchools(res.schools))
      .catch(() => {
        addToast({
          message: "학교 목록을 불러오지 못했습니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      })
  }, [addToast])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onSubmit",
  })

  const schoolId = watch("schoolId")

  const onSubmit = (data: BasicInfoFormData) => {
    setBasicInfo(data)
    setStep("terms")
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-[360px] flex-col gap-6"
    >
      <div className="flex flex-col gap-1">
        <p className="text-heading-3-bold">기본 정보</p>
        <p className="text-label-2-medium text-teal-gray-400">
          프로필에 표시될 정보를 입력해주세요.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-label-2-medium">이름</label>
          <input
            {...register("name")}
            type="text"
            maxLength={10}
            placeholder="이름을 입력해주세요. (최대 10자)"
            className="border-teal-gray-200 text-body-2-medium w-full rounded-lg border px-4 py-3 outline-none focus:border-teal-600"
          />
          {errors.name && (
            <p className="text-label-2-medium text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label-2-medium">닉네임</label>
          <input
            {...register("nickname")}
            type="text"
            maxLength={5}
            placeholder="한글 1~5자로 입력해주세요."
            className="border-teal-gray-200 text-body-2-medium w-full rounded-lg border px-4 py-3 outline-none focus:border-teal-600"
          />
          {errors.nickname && (
            <p className="text-label-2-medium text-red-500">
              {errors.nickname.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label-2-medium">학교</label>
          <select
            value={schoolId ?? ""}
            onChange={(e) =>
              setValue("schoolId", Number(e.target.value), {
                shouldValidate: true,
              })
            }
            className="border-teal-gray-200 text-body-2-medium w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-teal-600"
          >
            <option value="" disabled>
              학교를 선택해주세요.
            </option>
            {schools.map((s) => (
              <option key={s.schoolId} value={s.schoolId}>
                {s.schoolName}
              </option>
            ))}
          </select>
          {errors.schoolId && (
            <p className="text-label-2-medium text-red-500">
              {errors.schoolId.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" variant="fill" color="primary" className="w-full">
        다음
      </Button>
    </form>
  )
}
