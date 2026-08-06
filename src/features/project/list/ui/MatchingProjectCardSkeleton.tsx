import { cn } from "@/shared/lib/utils"

interface MatchingProjectCardSkeletonProps {
  /** 게스트 카드는 작성자 줄과 모집 현황이 없어 아래쪽이 짧다. */
  variant?: "default" | "guest"
  className?: string
}

export function MatchingProjectCardSkeleton({
  variant = "default",
  className,
}: MatchingProjectCardSkeletonProps) {
  const isGuest = variant === "guest"

  return (
    <div
      aria-hidden
      className={cn(
        "shadow-drop-neutral-4 flex w-full min-w-0 flex-col items-stretch overflow-hidden rounded-xl bg-white",
        className,
      )}
    >
      <div className="bg-teal-gray-150 aspect-[348/184] w-full shrink-0 animate-pulse" />

      <div
        className={cn(
          "flex w-full min-w-0 flex-col items-start p-5",
          isGuest ? "gap-3" : "gap-4",
        )}
      >
        <div className="flex w-full min-w-0 flex-col items-start gap-1.5">
          <div className="bg-teal-gray-150 h-6 w-2/5 animate-pulse rounded-md" />
          {isGuest ? (
            <div className="flex w-full flex-col gap-1">
              <div className="bg-teal-gray-150 h-4 w-full animate-pulse rounded-md" />
              <div className="bg-teal-gray-150 h-4 w-4/5 animate-pulse rounded-md" />
            </div>
          ) : (
            <>
              <div className="bg-teal-gray-150 h-4 w-full animate-pulse rounded-md" />
              <div className="bg-teal-gray-150 h-3.5 w-1/3 animate-pulse rounded-md" />
            </>
          )}
        </div>

        {isGuest ? (
          <div className="bg-teal-gray-150 h-3.5 w-1/2 animate-pulse rounded-md" />
        ) : (
          <div className="flex h-20 w-full min-w-0 flex-col items-start gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex w-full items-center justify-between">
                <div className="bg-teal-gray-150 h-4 w-28 animate-pulse rounded-md" />
                <div className="bg-teal-gray-150 h-6 w-14 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
