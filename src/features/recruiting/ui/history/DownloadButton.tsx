import DownloadIcon from "@/shared/assets/icon/download/DownloadIcon"
import { cn } from "@/shared/lib/utils"

interface DownloadButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function DownloadButton({
  onClick,
  disabled = false,
  loading = false,
  className,
}: DownloadButtonProps) {
  const isDisabled = disabled || loading

  if (loading) {
    return (
      <span
        className={cn(
          "flex h-11 items-center justify-center gap-1 rounded-[10px] bg-teal-700 px-4",
          className,
        )}
      >
        <span
          aria-hidden
          className="size-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"
        />
        <span
          aria-hidden
          className="size-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]"
        />
        <span
          aria-hidden
          className="size-2 animate-bounce rounded-full bg-white/20"
        />
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "text-label-1-semibold flex h-11 items-center gap-1 rounded-[10px] py-1 pr-3.5 pl-3",
        isDisabled
          ? "text-teal-gray-50 cursor-not-allowed bg-teal-300"
          : "bg-teal-600 text-white hover:bg-teal-700",
        className,
      )}
    >
      <DownloadIcon className="size-4" />
      다운로드
    </button>
  )
}
