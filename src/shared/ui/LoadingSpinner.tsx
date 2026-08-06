import { cn } from "@/shared/lib/utils"

const SIZE_CLASS = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-11 w-11 border-4",
} as const

interface LoadingSpinnerProps {
  size?: keyof typeof SIZE_CLASS
  /** 스크린리더용 문구. 화면에는 보이지 않는다. */
  label?: string
  className?: string
  /** 어두운 배경 위에 띄울 때처럼 링 색을 바꿔야 하는 경우에만 쓴다. */
  trackClassName?: string
}

export function LoadingSpinner({
  size = "md",
  label = "불러오는 중",
  className,
  trackClassName,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "border-teal-gray-200 animate-spin rounded-full border-t-teal-400 motion-reduce:animate-none",
          SIZE_CLASS[size],
          trackClassName,
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
