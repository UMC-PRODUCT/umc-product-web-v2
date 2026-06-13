import { forwardRef, useEffect, useRef, useState } from "react"

import CloseCircleIcon from "@/shared/assets/icon/close/CloseCircleIcon"
import UploadImageIcon from "@/shared/assets/icon/upload/UploadImageIcon"
import { cn } from "@/shared/lib/utils"

type ImageUploaderVariant = "thumbnail" | "logo"

const variantSize: Record<ImageUploaderVariant, string> = {
  thumbnail: "aspect-[540/286] w-full",
  logo: "aspect-square w-40 max-w-full bp1:w-50",
}

const variantRound: Record<ImageUploaderVariant, string> = {
  thumbnail: "rounded-t-[12px]",
  logo: "rounded-[12px]",
}

const variantLabels: Record<
  ImageUploaderVariant,
  { upload: string; change: string; remove: string }
> = {
  thumbnail: {
    upload: "프로젝트 썸네일 업로드",
    change: "프로젝트 썸네일 변경",
    remove: "프로젝트 썸네일 제거",
  },
  logo: {
    upload: "프로젝트 로고 업로드",
    change: "프로젝트 로고 변경",
    remove: "프로젝트 로고 제거",
  },
}

const variantHint: Record<ImageUploaderVariant, string> = {
  thumbnail: "JPG, PNG 형식의 10MB 이하 파일\n540*286px 비율",
  logo: "JPG, PNG, SVG 형식의\n10MB 이하 정사각형 파일",
}

const variantPlaceholder: Record<ImageUploaderVariant, string> = {
  thumbnail: "프로젝트 대표 이미지\n540 * 286",
  logo: "프로젝트 대표 로고",
}

const variantAccept: Record<ImageUploaderVariant, string> = {
  thumbnail: "image/jpeg,image/png",
  logo: "image/jpeg,image/png,image/svg+xml",
}

interface ImageUploaderProps {
  variant?: ImageUploaderVariant
  onChange: (file: File) => void
  onRemove?: () => void
  initialUrl?: string
  error?: string
  errorId?: string
  className?: string
  focusTarget?: string
}

export const ImageUploader = forwardRef<HTMLButtonElement, ImageUploaderProps>(
  function ImageUploader(
    {
      variant = "thumbnail",
      onChange,
      onRemove,
      initialUrl,
      error,
      errorId,
      className,
      focusTarget,
    },
    ref,
  ) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const activePreview = previewUrl ?? initialUrl ?? null
    const fileInputRef = useRef<HTMLInputElement>(null)

    const labels = variantLabels[variant]
    const hint = variantHint[variant]

    useEffect(() => {
      return () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
      }
    }, [previewUrl])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(file))
      onChange(file)
    }

    const handleRemove = () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      onRemove?.()
    }

    const hoverContent = (
      <>
        <span className="text-label-1-medium flex items-center gap-2">
          <UploadImageIcon
            aria-hidden="true"
            className="text-teal-gray-150 h-6 w-6 pb-1"
          />
          <span className="text-white">클릭 후 사진 업로드</span>
        </span>
        <span className="text-caption-2-medium text-teal-gray-100 text-center whitespace-pre">
          {hint}
        </span>
      </>
    )

    return (
      <>
        <div className={cn("relative", variantSize[variant], className)}>
          <button
            ref={ref}
            type="button"
            aria-label={activePreview ? labels.change : labels.upload}
            aria-invalid={!!error}
            aria-describedby={errorId}
            data-focus-target={focusTarget}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "bg-teal-gray-200 hover:bg-teal-gray-400 group relative h-full w-full overflow-hidden transition-colors focus:ring-2 focus:outline-none focus:ring-inset",
              error ? "focus:ring-error-400" : "focus:ring-teal-300",
              variantRound[variant],
              variant === "logo" &&
                activePreview &&
                "border-teal-gray-150 border",
            )}
          >
            {activePreview ? (
              <>
                <img
                  src={activePreview}
                  alt={labels.change}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {hoverContent}
                </div>
              </>
            ) : (
              <div className="text-teal-gray-400 text-body-2-regular flex flex-col items-center justify-center">
                <span className="text-center whitespace-pre transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0">
                  {variantPlaceholder[variant]}
                </span>
                <span className="absolute flex flex-col items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {hoverContent}
                </span>
              </div>
            )}
          </button>
          {activePreview && onRemove && (
            <button
              type="button"
              aria-label={labels.remove}
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="text-teal-gray-600 hover:text-teal-gray-800 absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white focus:ring-2 focus:ring-teal-300 focus:outline-none"
            >
              <CloseCircleIcon className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            className="text-caption-1-regular text-error-500 px-1 pt-1"
          >
            {error}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={variantAccept[variant]}
          aria-hidden="true"
          className="hidden"
          onChange={handleChange}
        />
      </>
    )
  },
)
