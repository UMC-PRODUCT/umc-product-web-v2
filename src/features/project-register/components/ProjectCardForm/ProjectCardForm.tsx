import { ImageUploader } from "@/components/common/ImageUploader"

import type { Ref } from "react"
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form"

import type { BasicInfoFormData } from "../../schemas/basicInfoSchema"

const MAX_LENGTH = 200
const MAX_LINES = 10

interface ProjectCardFormProps {
  nickname: string
  name: string
  university: string
  register: UseFormRegister<BasicInfoFormData>
  setValue: UseFormSetValue<BasicInfoFormData>
  watch: UseFormWatch<BasicInfoFormData>
  errors: FieldErrors<BasicInfoFormData>
  thumbnailRef?: Ref<HTMLButtonElement>
}

export function ProjectCardForm({
  nickname,
  name,
  university,
  register,
  setValue,
  watch,
  errors,
  thumbnailRef,
}: ProjectCardFormProps) {
  const description = watch("description") ?? ""

  return (
    <div className="border-teal-gray-100 flex h-116.5 w-135 flex-col rounded-[12px] border">
      <ImageUploader
        ref={thumbnailRef}
        focusTarget="thumbnail"
        variant="thumbnail"
        onChange={(file) =>
          setValue("thumbnail", file, { shouldValidate: true })
        }
      />
      <div className="h-fit w-full rounded-[12px] p-5">
        <div className="mb-2.5 flex items-center justify-between">
          <label htmlFor="service-title" className="sr-only">
            서비스 제목
          </label>
          <input
            id="service-title"
            type="text"
            placeholder="서비스 제목을 입력해주세요"
            aria-invalid={!!errors.title}
            {...register("title")}
            className="text-heading-6-semibold text-teal-gray-900 placeholder:text-teal-gray-400 w-2/3 bg-transparent outline-none aria-invalid:focus:rounded-sm aria-invalid:focus:ring-2 aria-invalid:focus:ring-teal-600"
          />
          <div className="text-body-2-regular text-teal-gray-500 flex items-center gap-2">
            <span>
              {nickname}/{name}
            </span>
            <span>·</span>
            <span>{university}</span>
          </div>
        </div>
        <label htmlFor="project-description" className="sr-only">
          프로젝트 소개
        </label>
        <textarea
          id="project-description"
          aria-invalid={!!errors.description}
          aria-describedby="description-count"
          className="placeholder:text-teal-gray-600 text-body-2-regular h-25 w-full resize-none p-2 outline-none aria-invalid:focus:rounded-sm aria-invalid:focus:ring-2 aria-invalid:focus:ring-teal-600"
          placeholder={`프로젝트 한 줄 소개를 적어주세요.\n공백 포함 200자까지 가능합니다.\n 줄 바꾸기도 가능합니다.`}
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
          className="text-caption-2-regular text-teal-gray-500 flex justify-end"
        >
          {description.length}/{MAX_LENGTH}
        </div>
      </div>
    </div>
  )
}
