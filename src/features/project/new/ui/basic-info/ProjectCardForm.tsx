import { useEffect, useState } from "react"

import { CounterLabel } from "@/shared/ui/CounterLabel"
import { ImageUploader } from "@/shared/ui/ImageUploader"

import { useProjectRegisterStore } from "../../model/useProjectRegisterStore"

import type { Ref } from "react"
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form"

import type { BasicInfoFormData } from "../../model/basicInfoSchema"

const MAX_LENGTH = 200
const MAX_LINES = 10

interface ProjectCardFormProps {
  nickname: string
  name: string
  university: string
  subPm?: { nickname: string; name: string; university: string } | null
  register: UseFormRegister<BasicInfoFormData>
  setValue: UseFormSetValue<BasicInfoFormData>
  watch: UseFormWatch<BasicInfoFormData>
  errors: FieldErrors<BasicInfoFormData>
  thumbnailRef?: Ref<HTMLButtonElement>
  thumbnailUrl?: string
  logoUrl?: string
}

export function ProjectCardForm({
  nickname,
  name,
  university,
  subPm,
  register,
  setValue,
  watch,
  errors,
  thumbnailRef,
  thumbnailUrl,
  logoUrl,
}: ProjectCardFormProps) {
  const setUploaded = useProjectRegisterStore((s) => s.setUploaded)
  const description = watch("description") ?? ""
  const logo = watch("logo")
  const [localLogoPreviewUrl, setLocalLogoPreviewUrl] = useState<string | null>(
    null,
  )
  const logoPreviewUrl = localLogoPreviewUrl ?? logoUrl ?? null

  useEffect(() => {
    if (!(logo instanceof File)) {
      setLocalLogoPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(logo)
    setLocalLogoPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [logo])

  return (
    <div className="border-teal-gray-100 flex h-116.5 w-135 flex-col rounded-[12px] border">
      <ImageUploader
        ref={thumbnailRef}
        focusTarget="thumbnail"
        variant="thumbnail"
        initialUrl={thumbnailUrl}
        onChange={(file) => {
          setValue("thumbnail", file, { shouldValidate: true })
          setUploaded({ thumbnailFileId: null, thumbnailUrl: null })
        }}
      />
      <div className="h-fit w-full rounded-[12px] p-5">
        <div className="mb-2.5 flex items-center justify-between">
          <label htmlFor="service-title" className="sr-only">
            서비스 제목
          </label>
          {logoPreviewUrl ? (
            <img
              src={logoPreviewUrl}
              alt="프로젝트 로고"
              className="mr-1 h-10 w-10 rounded-[8px] object-cover"
            />
          ) : (
            <div className="bg-teal-gray-200 mr-1 h-10 w-10 rounded-[8px]" />
          )}
          <input
            id="service-title"
            type="text"
            placeholder="서비스 제목을 입력해주세요"
            aria-invalid={!!errors.title}
            {...register("title")}
            className="text-heading-6-semibold text-teal-gray-900 placeholder:text-teal-gray-400 aria-invalid:focus:ring-error-500 w-4/7 bg-transparent px-1 outline-none aria-invalid:focus:rounded-sm aria-invalid:focus:ring-2"
          />
          <div className="text-body-2-regular text-teal-gray-500 flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-2">
              <span>
                {nickname}/{name}
              </span>
              <span>·</span>
              <span>{university}</span>
            </div>
            {subPm && (
              <div className="flex items-center gap-2">
                <span>
                  {subPm.nickname}/{subPm.name}
                </span>
                <span>·</span>
                <span>{subPm.university}</span>
              </div>
            )}
          </div>
        </div>
        <label htmlFor="project-description" className="sr-only">
          프로젝트 소개
        </label>
        <textarea
          id="project-description"
          aria-invalid={!!errors.description}
          aria-describedby="description-count"
          className="placeholder:text-teal-gray-600 text-body-2-regular aria-invalid:focus:ring-error-500 h-25 w-full resize-none p-2 outline-none aria-invalid:focus:rounded-sm aria-invalid:focus:ring-2"
          placeholder={`프로젝트 한 줄 소개를 적어주세요.\n최대 10줄 및 공백 포함 최대 200까지 입력 가능합니다.`}
          maxLength={MAX_LENGTH}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              e.currentTarget.value.split("\n").length >= MAX_LINES
            ) {
              e.preventDefault()
            }
          }}
          {...register("description", {
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
              const lines = e.target.value.split("\n")
              if (lines.length > MAX_LINES) {
                e.target.value = lines.slice(0, MAX_LINES).join("\n")
              }
            },
          })}
        />
        <div
          id="description-count"
          aria-live="polite"
          aria-atomic="true"
          className="flex justify-end"
        >
          <CounterLabel
            current={description.length}
            total={MAX_LENGTH}
            size="xs"
          />
        </div>
      </div>
    </div>
  )
}
