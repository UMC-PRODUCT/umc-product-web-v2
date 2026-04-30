import FileClip from "@/shared/assets/icon/upload/FileClip"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"

import type { ComponentProps } from "react"

interface FileUploadFieldProps extends Omit<ComponentProps<"div">, "children"> {
  fileName?: string | null
  placeholder?: string
  onUpload: () => void
  onDelete: () => void
}

export function FileUploadField({
  fileName = null,
  placeholder = "파일을 업로드해주세요.",
  onUpload,
  onDelete,
  className,
  ...props
}: FileUploadFieldProps) {
  const isEmpty = fileName === null || fileName === ""

  return (
    <div
      className={cn(
        "border-teal-gray-150 flex h-15 w-full min-w-200 items-center justify-between gap-1.5 rounded-[12px] border bg-[color-mix(in_srgb,var(--color-teal-50)_40%,white)] py-4 pr-3.5 pl-5",
        className,
      )}
      {...props}
    >
      {isEmpty ? (
        <>
          <span className="text-body-1-regular text-teal-gray-400 flex-1 truncate">
            {placeholder}
          </span>
          <Button
            size="xs"
            color="primary"
            onClick={onUpload}
            className="w-auto min-w-fit px-3"
          >
            파일 업로드
          </Button>
        </>
      ) : (
        <>
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            <FileClip className="text-teal-gray-700 h-5 w-5 shrink-0" />
            <span className="text-body-1-medium truncate text-teal-600">
              {fileName}
            </span>
          </div>
          <Button size="xs" color="neutral" onClick={onDelete}>
            삭제
          </Button>
        </>
      )}
    </div>
  )
}
