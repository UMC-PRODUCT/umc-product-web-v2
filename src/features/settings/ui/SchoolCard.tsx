import { cn } from "@/shared/lib/utils"

export interface SchoolCardProps {
  branch: string
  name: string
  count: number
  logoUrl?: string
  className?: string
}

export function SchoolCard({
  branch,
  name,
  count,
  logoUrl,
  className,
}: SchoolCardProps) {
  return (
    <div
      className={cn(
        "shadow-drop-neutral-2 flex h-[107px] w-full gap-4 rounded-[16px] border border-transparent bg-white p-4 transition-colors",
        "hover:border-teal-gray-200",
        className,
      )}
    >
      <div className="pt-1.5 pb-[19px]">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={name}
            className="size-12.5 rounded-full object-cover"
          />
        ) : (
          <div className="size-12.5 rounded-full bg-black" />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-subtitle-4-semibold text-teal-600">{branch}</span>
        <span className="text-heading-7-semibold text-teal-900">{name}</span>
        <span className="text-body-2-regular text-teal-gray-500">
          총 {count}명
        </span>
      </div>
    </div>
  )
}
