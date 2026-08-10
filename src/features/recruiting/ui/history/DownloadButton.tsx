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

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "text-label-1-semibold flex h-11 items-center justify-center gap-1 rounded-[10px] py-1 pr-3.5 pl-3",
        loading
          ? "bg-teal-700"
          : isDisabled
            ? "text-teal-gray-50 cursor-not-allowed bg-teal-300"
            : "bg-teal-600 text-white hover:bg-teal-700",
        className,
      )}
    >
      {loading ? (
        <>
          <span className="sr-only">다운로드 중</span>
          <span className="flex items-center gap-1" aria-hidden="true">
            <span className="size-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
            <span className="size-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
            <span className="size-2 animate-bounce rounded-full bg-white/20" />
          </span>
        </>
      ) : (
        <>
          <DownloadIcon className="size-4" />
          다운로드
        </>
      )}
    </button>
  )
}
