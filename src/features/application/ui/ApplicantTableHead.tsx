import { cn } from "@/shared/lib/utils"

const COLUMNS = [
  { label: "프로젝트", width: "w-[12.5rem]", align: "justify-center pr-4" },
  { label: "파트", width: "w-[7.625rem]", align: "px-4" },
  { label: "챌린저", width: "w-[12.5rem]", align: "px-16" },
  { label: "상태", width: "w-[8.5rem]", align: "px-[1.625rem] justify-center" },
  { label: "Design 배정", width: "w-[6.5rem]", align: "justify-center" },
  { label: "FE 배정", width: "w-[6.5625rem]", align: "justify-center" },
  { label: "BE 배정", width: "w-[6.6875rem]", align: "justify-center" },
] as const

interface ApplicantTableHeadProps {
  className?: string
}

export function ApplicantTableHead({ className }: ApplicantTableHeadProps) {
  return (
    <div
      role="row"
      className={cn(
        "flex h-10 items-center rounded-t-xl bg-teal-100 pr-5.5 pl-2.5",
        className,
      )}
    >
      <div className="flex items-center gap-4" role="rowheader">
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
    </div>
  )
}
