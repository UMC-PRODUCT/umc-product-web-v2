import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { cn } from "@/shared/lib/utils"

interface GenerationListItemProps extends React.ComponentProps<"button"> {
  generation: number
  year: number
  active?: boolean
  onClick?: () => void
}

export default function GenerationListItem({
  generation,
  year,
  active = false,
  onClick,
  className,
}: GenerationListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-6.5 w-31.5 items-center rounded-lg py-1 pr-2 transition-colors",
        active ? "bg-teal-50 pl-1.5" : "hover:bg-teal-gray-50 bg-white pl-3",
        className,
      )}
    >
      {active && <CheckIcon className="mr-0.5 size-4 shrink-0 text-teal-600" />}
      <div className="flex flex-1 items-center justify-between">
        <span
          className={cn(
            "text-body-3-regular",
            active ? "text-body-3-medium text-teal-600" : "text-teal-gray-600",
          )}
        >
          {generation}기
        </span>
        <span
          className={cn(
            "text-[8px] leading-[1.6] font-medium tracking-[-0.16px]",
            active ? "text-teal-500" : "text-teal-gray-300",
          )}
        >
          {year}
        </span>
      </div>
    </button>
  )
}
