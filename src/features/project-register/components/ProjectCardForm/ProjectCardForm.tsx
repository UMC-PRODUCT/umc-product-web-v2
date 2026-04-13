import { useEffect, useRef, useState } from "react"

import UploadImageIcon from "@/assets/icon/upload/UploadImageIcon"

const MAX_LENGTH = 200

interface ProjectCardFormProps {
  nickname: string
  name: string
  university: string
}

export function ProjectCardForm({
  nickname,
  name,
  university,
}: ProjectCardFormProps) {
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (thumbnail) URL.revokeObjectURL(thumbnail)
    }
  }, [thumbnail])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (thumbnail) URL.revokeObjectURL(thumbnail)
    setThumbnail(URL.createObjectURL(file))
  }

  return (
    <div className="border-teal-gray-100 flex h-116.5 w-135 flex-col rounded-[12px] border">
      <button
        type="button"
        aria-label={
          thumbnail ? "프로젝트 썸네일 변경" : "프로젝트 썸네일 업로드"
        }
        onClick={() => fileInputRef.current?.click()}
        className="bg-teal-gray-200 hover:bg-teal-gray-400 group relative h-71.5 w-full overflow-hidden rounded-t-[12px] transition-colors"
      >
        {thumbnail ? (
          <>
            <img
              src={thumbnail}
              alt="프로젝트 썸네일"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <UploadImageIcon className="h-6 w-6 text-white" />
              <span className="text-label-1-medium text-white">
                클릭 후 사진 변경
              </span>
            </div>
          </>
        ) : (
          <div className="text-teal-gray-400 text-body-2-regular flex flex-col items-center justify-center">
            <span className="transition-opacity duration-200 group-hover:opacity-0">
              프로젝트 대표 이미지
            </span>
            <span className="transition-opacity duration-200 group-hover:opacity-0">
              540 * 286
            </span>
            <span className="absolute flex flex-col items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="text-label-1-medium flex items-center gap-2">
                <UploadImageIcon className="text-teal-gray-700 h-6 w-6 pb-1" />
                <span className="text-white">클릭 후 사진 업로드</span>
              </span>
              <span className="text-caption-2-medium text-teal-gray-100">
                JPG, PNG 형식의 10MB 이하 파일
              </span>
            </span>
          </div>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-hidden="true"
        className="hidden"
        onChange={handleThumbnailChange}
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
            className="text-heading-6-semibold text-teal-gray-900 placeholder:text-teal-gray-400 w-2/3 bg-transparent outline-none"
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
          className="placeholder:text-teal-gray-600 text-body-2-regular h-25 w-full resize-none p-2"
          placeholder={`프로젝트 한 줄 소개를 적어주세요.\n공백 포함 200자까지 가능합니다.\n 줄 바꾸기도 가능합니다.`}
          maxLength={MAX_LENGTH}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div
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
