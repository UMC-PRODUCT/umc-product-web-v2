export function ApplyFormSkeleton() {
  return (
    <div className="flex w-232 flex-col">
      <div className="flex w-full items-end">
        <div className="clip-trapezoid-sm flex h-15 w-69.5 items-center gap-3.5 bg-teal-100 py-2.5 pr-14 pl-4">
          <div className="bg-teal-gray-200 size-8 shrink-0 animate-pulse rounded-lg" />
          <div className="flex flex-col gap-1.5">
            <div className="bg-teal-gray-200 h-3 w-40 animate-pulse rounded" />
            <div className="bg-teal-gray-200 h-2.5 w-28 animate-pulse rounded" />
          </div>
        </div>
        <div className="-ml-1.5 h-1.75 flex-1 rounded-tr-xl bg-teal-100" />
      </div>

      <div className="shadow-drop-neutral-3 flex w-full flex-col rounded-2xl bg-white">
        <div className="scrollbar-none max-h-[75vh] overflow-y-auto px-11.5 py-9">
          <div className="flex items-start gap-6 self-stretch px-1 py-5">
            <div className="flex flex-1 flex-col gap-2">
              <div className="bg-teal-gray-150 h-4 w-full animate-pulse rounded-md" />
              <div className="bg-teal-gray-150 h-4 w-5/6 animate-pulse rounded-md" />
              <div className="bg-teal-gray-150 h-4 w-2/3 animate-pulse rounded-md" />
            </div>
            <div className="flex w-74.5 shrink-0 flex-col gap-2.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex w-full items-center justify-between"
                >
                  <div className="bg-teal-gray-150 h-4 w-30.5 animate-pulse rounded-md" />
                  <div className="bg-teal-gray-150 h-6 w-14 animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-5 pb-6">
            <div className="flex w-full items-end">
              <div className="bg-teal-gray-150 h-9 w-32 rounded-t-[12px]" />
              <div className="bg-teal-gray-150 h-1.5 flex-1 rounded-tr-xl" />
            </div>
            <div className="flex flex-col gap-10 self-stretch rounded-b-[12px] border border-teal-200 bg-white pt-8.5 pr-5 pb-9.5 pl-5">
              {[0, 1].map((i) => (
                <div key={i} className="flex w-full flex-col gap-3">
                  <div className="bg-teal-gray-150 h-5 w-2/3 animate-pulse rounded-md" />
                  <div className="bg-teal-gray-150 h-15 w-full animate-pulse rounded-[12px]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-teal-gray-100 flex justify-center gap-3 border-t px-6 py-4">
          <div className="bg-teal-gray-150 h-14 w-24 animate-pulse rounded-xl" />
          <div className="bg-teal-gray-150 h-14 w-24 animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  )
}
