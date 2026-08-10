import { cn } from "@/shared/lib/utils"
import { ExpandableTableHead } from "@/shared/ui/table/ExpandableTableHead"

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
    <ExpandableTableHead
      expanded={hasExpanded}
      onToggle={hideExpandButton ? undefined : onToggleAll}
      className={className}
    >
      <div className="flex flex-1 items-center">
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
    </ExpandableTableHead>
  )
}
