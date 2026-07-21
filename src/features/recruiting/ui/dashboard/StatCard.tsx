import PersonGraphicIcon from "@/shared/assets/icon/people/PersonGraphicIcon"

interface StatCardProps {
  title: string
  count: number
  footer:
    | { type: "timestamp"; date: string; time: string }
    | { type: "ratio"; totalCount: number }
}

export function StatCard({ title, count, footer }: StatCardProps) {
  return (
    <div
      className="border-teal-gray-100 shadow-drop-neutral-3 flex size-70 flex-col gap-10 overflow-clip rounded-xl border bg-white px-8 py-7"
      style={{
        backgroundImage:
          "linear-gradient(-67.8deg, rgba(34, 144, 132, 0.015) 16.5%, rgba(255, 255, 255, 0.05) 30%), linear-gradient(119.5deg, rgba(34, 144, 132, 0.025) 8.3%, rgba(255, 255, 255, 0.05) 46.7%), linear-gradient(90deg, rgba(143, 255, 243, 0.08) 0%, rgba(143, 255, 243, 0.08) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)",
      }}
    >
      <h3 className="text-heading-6-semibold text-teal-700">{title}</h3>
      <div className="flex w-full flex-col items-center gap-1.5 px-7.5 pt-3.25 pb-14">
        <div className="flex w-full items-center justify-center gap-3">
          <PersonGraphicIcon
            width={36}
            height={36}
            className="shrink-0 text-teal-500"
          />
          <p className="text-display-2-medium whitespace-nowrap text-teal-500">
            {count.toLocaleString()} 명
          </p>
        </div>
        {footer.type === "timestamp" && (
          <p className="text-body-1-regular text-teal-gray-400">
            {footer.date} {footer.time} 기준
          </p>
        )}
        {footer.type === "ratio" && (
          <p className="text-subtitle-1-medium text-teal-gray-500">
            <span className="text-body-1-medium text-teal-gray-400">/</span>총
            지원자 {footer.totalCount} 명
          </p>
        )}
      </div>
    </div>
  )
}
