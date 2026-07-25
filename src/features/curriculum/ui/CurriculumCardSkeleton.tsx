import { ChevronDown } from "lucide-react"

export function CurriculumCardSkeleton() {
  return (
    <div className="border-teal-gray-100 shadow-drop-neutral-2 flex w-full items-center justify-between gap-4 rounded-[16px] border bg-white px-6 py-7">
      <div className="flex flex-1 animate-pulse flex-col gap-5">
        <div className="bg-teal-gray-200 h-4.5 w-full rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-90 max-w-full rounded-[4px]"></div>
      </div>
      <ChevronDown className="text-teal-gray-700 size-7.5 shrink-0" />
    </div>
  )
}
