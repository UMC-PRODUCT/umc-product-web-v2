import FileClip from "@/shared/assets/icon/upload/FileClip"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"

import type { ComponentProps } from "react"

interface FileUploadFieldProps extends Omit<ComponentProps<"div">, "children"> {
  fileName?: string | null
  placeholder?: string
  size?: "lg" | "md"
  onUpload: () => void
  onDelete: () => void
  error?: string
  ariaLabel?: string
}

export function FileUploadField({
  fileName = null,
  placeholder = "파일을 업로드해주세요.",
  size = "lg",
  onUpload,
  onDelete,
  error,
  ariaLabel,
  className,
  ...props
}: FileUploadFieldProps) {
  const isEmpty = fileName === null || fileName === ""

  return (
    <div className="flex w-full flex-col gap-1">
      <div
        className={cn(
          "border-teal-gray-150 flex w-full min-w-0 items-center justify-between gap-1.5 rounded-[12px] border bg-white",
          size === "md" ? "h-13.5 py-2.5 pr-3 pl-4" : "h-15 py-4 pr-4 pl-5",
          error && "border-error-500",
          className,
        )}
        {...props}
      >
        {isEmpty ? (
          <>
            <span
              className={cn(
                "text-teal-gray-400 flex-1 truncate",
                size === "md" ? "text-body-2-medium" : "text-body-1-regular",
              )}
            >
              {placeholder}
            </span>
            <Button
              size="xs"
              color="primary"
              onClick={onUpload}
              aria-label={ariaLabel ? `${ariaLabel} 파일 업로드` : undefined}
              className="w-auto min-w-fit px-3"
            >
              파일 업로드
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              <FileClip className="text-teal-gray-700 h-5 w-5 shrink-0" />
              <span
                className={cn(
                  "truncate text-teal-600",
                  size === "md" ? "text-body-2-medium" : "text-body-1-medium",
                )}
              >
                {fileName}
              </span>
            </div>
            <Button
              size="xs"
              color="neutral"
              onClick={onDelete}
              aria-label={ariaLabel ? `${ariaLabel} 파일 삭제` : undefined}
            >
              삭제
            </Button>
          </>
        )}
      </div>
      {error && (
        <p className="text-caption-2-regular text-error-600 px-1">{error}</p>
      )}
    </div>
  )
}
