import LeftChevronIcon from "@/shared/assets/icon/chevron/LeftChevronIcon"
import RightChevronIcon from "@/shared/assets/icon/chevron/RightChevronIcon"
import { cn } from "@/shared/lib/utils"

export type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages < 1) return null

  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const showPrev = safePage > 1
  const showNext = safePage < totalPages

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav
      className={cn(
        "inline-flex items-center justify-center gap-2.5",
        className,
      )}
      aria-label="페이지 네비게이션"
    >
      {showPrev ? (
        <button
          type="button"
          className="text-teal-gray-400 hover:text-teal-gray-700 hover:bg-teal-gray-50 hover:shadow-pagination-num-hover flex h-[1.875rem] w-[1.875rem] shrink-0 items-center justify-center gap-1 rounded-xl border-0 bg-transparent transition-colors transition-shadow focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:outline-none disabled:pointer-events-none"
          aria-label="이전 페이지"
          onClick={() => onPageChange(safePage - 1)}
        >
          <LeftChevronIcon aria-hidden className="pointer-events-none size-4" />
        </button>
      ) : null}

      <div className="flex items-center gap-4">
        {pageNumbers.map((page) => {
          const isActive = page === safePage
          return (
            <button
              key={page}
              type="button"
              aria-label={`${page}페이지`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "text-subtitle-4-semibold text-teal-gray-900 flex h-[1.875rem] min-w-[1.875rem] shrink-0 items-center justify-center gap-1 rounded-xl border-0 px-1 transition-colors transition-shadow focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:outline-none disabled:pointer-events-none",
                isActive
                  ? "bg-teal-gray-100 hover:bg-teal-gray-100"
                  : "hover:bg-teal-gray-50 hover:shadow-pagination-num-hover bg-transparent",
              )}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        })}
      </div>

      {showNext ? (
        <button
          type="button"
          className="text-teal-gray-400 hover:text-teal-gray-700 hover:bg-teal-gray-50 hover:shadow-pagination-num-hover flex h-[1.875rem] w-[1.875rem] shrink-0 items-center justify-center gap-1 rounded-xl border-0 bg-transparent transition-colors transition-shadow focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:outline-none disabled:pointer-events-none"
          aria-label="다음 페이지"
          onClick={() => onPageChange(safePage + 1)}
        >
          <RightChevronIcon
            aria-hidden
            className="pointer-events-none size-4"
          />
        </button>
      ) : null}
    </nav>
  )
}
