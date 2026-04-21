import { forwardRef, useEffect, useRef, useState } from "react"

import UploadImageIcon from "@/shared/assets/icon/upload/UploadImageIcon"
import { cn } from "@/shared/lib/utils"

type ImageUploaderVariant = "thumbnail" | "logo"

const variantClasses: Record<ImageUploaderVariant, string> = {
  thumbnail: "h-71.5 w-135 rounded-t-[12px]",
  logo: "h-50 w-50 rounded-[12px]",
}

const variantLabels: Record<
  ImageUploaderVariant,
  { upload: string; change: string }
> = {
  thumbnail: {
    upload: "프로젝트 썸네일 업로드",
    change: "프로젝트 썸네일 변경",
  },
  logo: { upload: "프로젝트 로고 업로드", change: "프로젝트 로고 변경" },
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
  error?: string
  errorId?: string
  className?: string
  focusTarget?: string
}

export const ImageUploader = forwardRef<HTMLButtonElement, ImageUploaderProps>(
  function ImageUploader(
    { variant = "thumbnail", onChange, error, errorId, className, focusTarget },
    ref,
  ) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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
        <button
          ref={ref}
          type="button"
          aria-label={previewUrl ? labels.change : labels.upload}
          aria-invalid={!!error}
          aria-describedby={errorId}
          data-focus-target={focusTarget}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "bg-teal-gray-200 hover:bg-teal-gray-400 group relative overflow-hidden transition-colors focus:ring-2 focus:outline-none focus:ring-inset",
            error ? "focus:ring-error-400" : "focus:ring-teal-300",
            variantClasses[variant],
            variant === "logo" && previewUrl && "border-teal-gray-150 border",
            className,
          )}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
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
