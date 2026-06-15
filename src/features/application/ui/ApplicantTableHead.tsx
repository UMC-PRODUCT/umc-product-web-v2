import CollapseAllIcon from "@/shared/assets/icon/expand-collapse/CollapseAllIcon"
import ExpandAllIcon from "@/shared/assets/icon/expand-collapse/ExpandAllIcon"
import { cn } from "@/shared/lib/utils"

const COLUMNS = [
  { label: "프로젝트", width: "w-[184px]", align: "justify-center pr-4" },
  { label: "파트", width: "w-[7.625rem]", align: "px-4 justify-center" },
  { label: "챌린저", width: "w-[12.5rem]", align: "pl-4" },
  { label: "상태", width: "w-[8.5rem]", align: "px-[1.625rem] justify-center" },
  { label: "Design 배정", width: "w-[6.5rem]", align: "justify-center" },
  { label: "FE 배정", width: "w-[6.5625rem]", align: "justify-center" },
  { label: "BE 배정", width: "w-[6.6875rem]", align: "justify-center" },
] as const

interface ApplicantTableHeadProps {
  hasExpanded?: boolean
  onToggleAll?: () => void
  hideExpandButton?: boolean
  className?: string
}

export function ApplicantTableHead({
  hasExpanded = false,
  onToggleAll,
  hideExpandButton = false,
  className,
}: ApplicantTableHeadProps) {
  return (
    <div
      role="row"
      className={cn(
        "flex h-10 items-center rounded-t-xl bg-teal-100 pr-5.5 pl-2.5",
        className,
      )}
    >
      <div className="flex flex-1 items-center" role="rowheader">
        {COLUMNS.map((col) => (
          <span
            key={col.label}
            role="columnheader"
            className={cn(
              "text-body-2-medium flex items-center text-teal-900",
              col.width,
              col.align,
            )}
          >
            {col.label}
          </span>
        ))}
      </div>

      {!hideExpandButton && (
        <button
          type="button"
          aria-label={hasExpanded ? "모두 접기" : "모두 펼치기"}
          onClick={onToggleAll}
          className="shadow-inner-neutral-2 flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-teal-100 transition-colors hover:bg-teal-200"
        >
          {hasExpanded ? (
            <CollapseAllIcon width={24} height={24} className="text-teal-700" />
          ) : (
            <ExpandAllIcon width={24} height={24} className="text-teal-700" />
          )}
        </button>
      )}
    </div>
  )
}
