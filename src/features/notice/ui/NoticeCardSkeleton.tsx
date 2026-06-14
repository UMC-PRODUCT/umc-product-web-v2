import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"

export function NoticeCardSkeleton() {
  return (
    <div className="flex w-full items-center justify-between gap-2.5 px-4 py-7 text-left">
      <div className="flex w-full animate-pulse flex-col gap-2">
        <div className="bg-teal-gray-150 h-5 w-full rounded-[4px]" />
        <div className="bg-teal-gray-150 h-5 w-50 rounded-[4px]" />
      </div>
      <DownChevronIcon
        aria-hidden="true"
        className="text-teal-gray-400 h-7.5 w-7.5 shrink-0"
      />
    </div>
  )
}
