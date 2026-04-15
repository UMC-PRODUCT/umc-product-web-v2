import { zodResolver } from "@hookform/resolvers/zod"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/common/Button"
import { ImageUploader } from "@/components/common/ImageUploader"
import { useToastStore } from "@/stores/useToastStore"

import {
  type BasicInfoFormData,
  basicInfoSchema,
} from "../schemas/basicInfoSchema"
import { useProjectRegisterStore } from "../stores/useProjectRegisterStore"
import { PlanningLinkInput } from "./PlanningLinkInput"
import { ProjectCardForm } from "./ProjectCardForm/ProjectCardForm"
import { SectionHeader } from "./SectionHeader"

interface BasicInfoFormProps {
  onNext: () => void
}

const MOCK_USER = { nickname: "닉넴", name: "아무개", university: "OO대 OOO" }

export function BasicInfoForm({ onNext }: BasicInfoFormProps) {
  const setBasicInfo = useProjectRegisterStore((s) => s.setBasicInfo)
  const addToast = useToastStore((s) => s.addToast)
  const [isSaving, setIsSaving] = useState(false)
  const thumbnailRef = useRef<HTMLButtonElement>(null)
  const logoRef = useRef<HTMLButtonElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    getValues,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    shouldFocusError: false,
  })

  const onInvalid = (fieldErrors: typeof errors) => {
    addToast({
      message: "모든 항목을 입력해주세요",
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3,
    })

    const values = getValues()

    setTimeout(() => {
      if (!(values.thumbnail instanceof File)) {
        document
          .querySelector<HTMLElement>('[data-focus-target="thumbnail"]')
          ?.focus()
        return
      }
      if (fieldErrors.title) {
        setFocus("title")
        return
      }
      if (fieldErrors.description) {
        setFocus("description")
        return
      }
      if (!(values.logo instanceof File)) {
        document
          .querySelector<HTMLElement>('[data-focus-target="logo"]')
          ?.focus()
        return
      }
      if (fieldErrors.planningLink) {
        setFocus("planningLink")
        return
      }
    }, 0)
  }

  const hasAnyValidInput = (
    Object.keys(dirtyFields) as (keyof BasicInfoFormData)[]
  ).some((field) => !errors[field])

  const handleTempSave = async () => {
    setIsSaving(true)
    try {
      // TODO: API 연결
    } finally {
      setIsSaving(false)
    }
  }

  const onSubmit = (data: BasicInfoFormData) => {
    setBasicInfo(data)
    onNext()
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="flex flex-col justify-start gap-14 pt-4"
    >
      <div className="flex flex-col gap-4">
        <SectionHeader index={1} title="프로젝트 카드" />
        <ProjectCardForm
          {...MOCK_USER}
          register={register}
          setValue={(name, value, options) =>
            setValue(name, value, { shouldDirty: true, ...options })
          }
          watch={watch}
          errors={errors}
          thumbnailRef={thumbnailRef}
        />
      </div>
      <div className="flex flex-col gap-4">
        <SectionHeader index={2} title="프로젝트 로고" />
        <ImageUploader
          ref={logoRef}
          focusTarget="logo"
          variant="logo"
          onChange={(file) =>
            setValue("logo", file, { shouldDirty: true, shouldValidate: true })
          }
        />
      </div>
      <div className="flex flex-col gap-4">
        <SectionHeader index={3} title="기획서 링크" />
        <PlanningLinkInput register={register} error={errors.planningLink} />
      </div>
      <div className="flex justify-between">
        <Button
          type="button"
          variant="weak"
          color="brand"
          disabled={!hasAnyValidInput}
          isLoading={isSaving}
          onClick={handleTempSave}
        >
          임시 저장
        </Button>
        <Button type="submit" variant="fill" color="brand">
          다음
        </Button>
      </div>
    </form>
  )
}
