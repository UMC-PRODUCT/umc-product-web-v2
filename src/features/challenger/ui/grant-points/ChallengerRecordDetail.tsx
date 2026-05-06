import { useQuery } from "@tanstack/react-query"

import { getChallengerInfo } from "@/features/challenger/api/challenger"
import {
  CHALLENGER_STATUS_LABEL,
  formatSignedPoint,
  PART_LABEL,
  POINT_TYPE_LABEL,
  toNumberSafe,
} from "@/features/challenger/model/enums"
import { cn } from "@/shared/lib/utils"

import type { ChallengerPointInfo } from "@/features/challenger/model/types"

interface ChallengerRecordDetailProps {
  challengerId: string
}

function formatDateTime(value: string) {
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch {
    return value
  }
}

export function ChallengerRecordDetail({
  challengerId,
}: ChallengerRecordDetailProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["challenger", "info", challengerId],
    queryFn: () => getChallengerInfo(challengerId),
  })

  if (isLoading) {
    return (
      <p className="text-body-2-medium text-teal-gray-400">
        챌린저 정보를 불러오는 중입니다...
      </p>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-body-2-medium text-error-500">
        챌린저 정보를 불러오지 못했습니다.
      </p>
    )
  }

  // 가이드 문서 A-2 / A-3: `challengerPoints` 는 deprecated, `points` 사용 권장
  const points: ChallengerPointInfo[] =
    data.points ?? data.challengerPoints ?? []

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-teal-gray-50 grid grid-cols-2 gap-x-6 gap-y-3 rounded-[12px] px-5 py-4 sm:grid-cols-4">
        <InfoItem label="이름" value={`${data.nickname}/${data.name}`} />
        <InfoItem label="기수" value={`${data.gisu}기`} />
        <InfoItem label="파트" value={PART_LABEL[data.part]} />
        <InfoItem
          label="상태"
          value={CHALLENGER_STATUS_LABEL[data.challengerStatus]}
        />
        <InfoItem label="지부" value={data.chapterName} />
        <InfoItem label="학교" value={data.schoolName} />
        <InfoItem
          label="이메일"
          value={data.email ?? "—"}
          className="col-span-2"
        />
        <InfoItem
          label="누적 점수"
          value={`${toNumberSafe(data.totalPoints).toFixed(1)}점`}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="text-subtitle-4-semibold text-teal-gray-800">
          상벌점 기록 ({points.length})
        </h3>
        {points.length === 0 ? (
          <p className="text-body-2-medium text-teal-gray-400">
            아직 부여된 상벌점이 없습니다.
          </p>
        ) : (
          <ul className="border-teal-gray-100 divide-teal-gray-100 flex w-full flex-col divide-y rounded-[12px] border">
            {points.map((point, index) => {
              const pointValue = toNumberSafe(point.point)
              return (
                <li
                  key={point.id ?? `${point.createdAt}-${index}`}
                  className="flex items-start justify-between gap-4 px-5 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-body-2-medium text-teal-gray-900">
                      {POINT_TYPE_LABEL[point.pointType]}
                    </span>
                    {point.description && (
                      <span className="text-caption-2-regular text-teal-gray-500">
                        {point.description}
                      </span>
                    )}
                    <span className="text-caption-3-regular text-teal-gray-400">
                      {formatDateTime(point.createdAt)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-subtitle-4-semibold whitespace-nowrap",
                      pointValue >= 0 ? "text-teal-600" : "text-error-500",
                    )}
                  >
                    {formatSignedPoint(pointValue)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

interface InfoItemProps {
  label: string
  value: string
  className?: string
}

function InfoItem({ label, value, className }: InfoItemProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-caption-2-medium text-teal-gray-500">{label}</span>
      <span className="text-body-2-medium text-teal-gray-900 truncate">
        {value}
      </span>
    </div>
  )
}
