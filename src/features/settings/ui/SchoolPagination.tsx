import LeftChevronIcon from "@/shared/assets/icon/chevron/LeftChevronIcon"
import RightChevronIcon from "@/shared/assets/icon/chevron/RightChevronIcon"
import { cn } from "@/shared/lib/utils"

export type SchoolPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function SchoolPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: SchoolPaginationProps) {
  if (totalPages < 1) return null

  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const showPrev = safePage > 1
  const showNext = safePage < totalPages

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav
      className={cn("flex items-center justify-center gap-4", className)}
      aria-label="페이지 네비게이션"
    >
      {showPrev && (
        <button
          type="button"
          aria-label="이전 페이지"
          className="shadow-inner-neutral-2 text-teal-gray-400 flex size-7.5 shrink-0 items-center justify-center rounded-[12px]"
          onClick={() => onPageChange(safePage - 1)}
        >
          <LeftChevronIcon aria-hidden className="pointer-events-none size-4" />
        </button>
      )}

      {pageNumbers.map((page) => {
        const isActive = page === safePage
        return (
          <button
            key={page}
            type="button"
            aria-label={`${page}페이지`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shadow-inner-neutral-2 text-teal-gray-900 size-7.5 shrink-0 rounded-[12px]",
              isActive && "bg-teal-gray-50",
            )}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      })}

      {showNext && (
        <button
          type="button"
          aria-label="다음 페이지"
          className="shadow-inner-neutral-2 text-teal-gray-400 flex size-7.5 shrink-0 items-center justify-center rounded-[12px]"
          onClick={() => onPageChange(safePage + 1)}
        >
          <RightChevronIcon
            aria-hidden
            className="pointer-events-none size-4"
          />
        </button>
      )}
    </nav>
  )
}
