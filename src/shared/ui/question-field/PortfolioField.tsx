import { useRef, useState } from "react"

import FileClip from "@/shared/assets/icon/upload/FileClip"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"

const MAX_FILE_BYTES = 150 * 1024 * 1024

export type PortfolioValue =
  | { kind: "link"; url: string }
  | { kind: "file"; name: string; file: File }

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

interface PortfolioFieldProps {
  value?: PortfolioValue | null
  onChange?: (value: PortfolioValue | null) => void
  error?: string
  className?: string
}

export function PortfolioField({
  value,
  onChange,
  error: errorProp,
  className,
}: PortfolioFieldProps) {
  const [link, setLink] = useState(value?.kind === "link" ? value.url : "")
  const [linkError, setLinkError] = useState("")
  const [fileName, setFileName] = useState<string | null>(
    value?.kind === "file" ? value.name : null,
  )
  const [fileError, setFileError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleLinkChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setLink(val)
    setLinkError("")
    if (!val) onChange?.(null)
  }

  function handleLinkBlur() {
    if (link && !isValidUrl(link)) {
      setLinkError("유효한 URL을 입력해 주세요. (예: https://example.com)")
    } else if (link) {
      onChange?.({ kind: "link", url: link })
    } else {
      onChange?.(null)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_BYTES) {
      setFileError("150MB 이하의 파일만 업로드 가능합니다.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setFileName(file.name)
    setFileError("")
    setLink("")
    setLinkError("")
    onChange?.({ kind: "file", name: file.name, file })
  }

  function handleDelete() {
    setFileName(null)
    setFileError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    onChange?.(null)
  }

  const displayError = linkError || fileError || errorProp

  return (
    <div className={cn("flex w-full max-w-203 flex-col gap-1", className)}>
      <div className="border-teal-gray-150 flex h-15 w-full items-center justify-between gap-1.5 rounded-[12px] border bg-[color-mix(in_srgb,var(--color-teal-50)_40%,white)] px-5 py-4">
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {fileName ? (
          <>
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              <FileClip className="text-teal-gray-700 h-5 w-5 shrink-0" />
              <span className="text-body-1-medium truncate text-teal-600">
                {fileName}
              </span>
            </div>
            <Button size="xs" color="neutral" onClick={handleDelete}>
              삭제
            </Button>
          </>
        ) : (
          <>
            <input
              type="url"
              value={link}
              onChange={handleLinkChange}
              onBlur={handleLinkBlur}
              placeholder="링크를 입력하거나 파일을 첨부해 주세요. 150MB 이하의 PDF 파일만 업로드 가능합니다."
              className={cn(
                "text-body-1-medium placeholder:text-body-1-regular placeholder:text-teal-gray-400 min-w-0 flex-1 bg-transparent outline-none",
                link ? "text-teal-600 underline" : "text-teal-gray-900",
              )}
            />
            <Button
              size="xs"
              color="primary"
              className="w-auto min-w-fit px-3"
              onClick={() => fileInputRef.current?.click()}
            >
              파일 업로드
            </Button>
          </>
        )}
      </div>

      {displayError && (
        <p className="text-caption-2-regular text-error-600 px-1">
          {displayError}
        </p>
      )}
    </div>
  )
}
