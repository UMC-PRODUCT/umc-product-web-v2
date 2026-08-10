import { PARTS } from "@/features/recruiting/model/parts"
import { GraphTooltip } from "@/features/recruiting/ui/dashboard/PartBreakdownTooltip"

import type {
  PartBreakdown,
  PartKey,
  PartMeta,
} from "@/features/recruiting/model/parts"

interface SchoolDatum {
  // 지부는 서버 값을 그대로 받는다. 같은 이름의 지부가 있을 수 있어 그룹핑과
  // key 는 chapterId 로 잡고 chapterName 은 표시에만 쓴다.
  chapterId: string
  chapterName: string
  // name 은 축약된 표시용이라 서로 겹칠 수 있다. key 는 schoolId 로 잡는다.
  schoolId: string
  name: string
  // 앞(컬러) 막대 값. 지원현황=지원자수, 평가현황=평가 완료 수.
  counts: Record<PartKey, number>
  // 평가현황에서만 사용. 뒤(회색) "지원자 수" 막대 값(분모). 있으면 평가 모드로 렌더.
  applicants?: Record<PartKey, number>
}

interface SchoolPartChartCardProps {
  title: string
  // 받은 순서대로 렌더한다. 지부별로 묶여 보이려면 호출부에서 정렬해 넘긴다.
  schools: SchoolDatum[]
  // 호버 툴팁 하단의 모집 상태(예: "모집 중", "추가 모집 중"). 없으면 미표기.
  footerStatus?: string
}

const SCHOOLS_PER_ROW = 15
const BAR_BAND_HEIGHT_PX = 100
const BAR_MIN_HEIGHT_PX = 2

// 막대 세로 그라데이션의 파트별 불투명도(피그마 값). 렌더링 전용이라 로컬 유지.
const GRADIENT_OPACITY: Record<PartKey, { top: number; mid: number }> = {
  pm: { top: 0.7, mid: 0.5 },
  design: { top: 0.6, mid: 0.5 },
  webPe: { top: 0.7, mid: 0.5 },
  mobilePe: { top: 0.5, mid: 0.4 },
}

// 파트별 막대 스타일: 베이스는 파스텔(chip300), 그 위에 액센트(rgb) 세로 그라데이션.
function barBackground(part: PartMeta): string {
  const { top, mid } = GRADIENT_OPACITY[part.key]
  return [
    `linear-gradient(180deg,`,
    `rgba(${part.accent}, ${top}) 47.596%,`,
    `rgba(${part.accent}, ${mid}) 75%,`,
    `rgba(${part.accent}, 0.25) 100%)`,
    `, ${part.chip300}`,
  ].join(" ")
}

// 높이 기준(Max): 모든 학교/모든 파트를 통틀어 가장 많이 지원한 값이 100px.
function barHeightPx(count: number, globalMax: number): number {
  if (count <= 0) return BAR_MIN_HEIGHT_PX
  return Math.max(
    BAR_MIN_HEIGHT_PX,
    Math.min((count / globalMax) * BAR_BAND_HEIGHT_PX, BAR_BAND_HEIGHT_PX),
  )
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size))
  }
  return rows
}

// 툴팁용 파트 상세로 변환. applicants가 있으면 평가 모드(평가/지원 쌍).
function toBreakdown(school: SchoolDatum): PartBreakdown {
  return PARTS.reduce((acc, part) => {
    acc[part.key] = school.applicants
      ? {
          applied: school.applicants[part.key],
          evaluated: school.counts[part.key],
        }
      : { applied: school.counts[part.key] }
    return acc
  }, {} as PartBreakdown)
}

export function SchoolPartChartCard({
  title,
  schools,
  footerStatus,
}: SchoolPartChartCardProps) {
  // 평가 모드: 학교 중 하나라도 지원자 수(applicants)를 가지면 회색 배경 막대 + 범례 추가.
  const hasApplicants = schools.some((school) => school.applicants)
  // 높이 기준(Max): 평가 모드면 지원자 수 최댓값, 지원 모드면 지원자 수(counts) 최댓값.
  const globalMax = Math.max(
    ...schools.flatMap((school) =>
      PARTS.map((part) => (school.applicants ?? school.counts)[part.key]),
    ),
    1,
  )
  const rows = chunk(schools, SCHOOLS_PER_ROW)

  return (
    <div className="border-teal-gray-100 shadow-drop-neutral-3 w-263 rounded-xl border bg-white px-8 py-7">
      <div className="flex flex-col gap-11.5">
        <div className="flex items-center justify-between">
          <p className="text-heading-6-semibold text-teal-700">{title}</p>
          <div className="flex items-center gap-2">
            {PARTS.map((part) => (
              <div key={part.key} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: `rgb(${part.accent})` }}
                />
                <p className="text-caption-1-medium text-teal-gray-700 whitespace-nowrap">
                  {part.label}
                </p>
              </div>
            ))}
            {hasApplicants && (
              <div className="flex items-center gap-1.5">
                <span className="bg-teal-gray-300 size-2.5 shrink-0 rounded-full" />
                <p className="text-caption-1-medium text-teal-gray-700 whitespace-nowrap">
                  지원자 수
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              <div className="pointer-events-none absolute inset-x-0 top-0 flex h-25 flex-col justify-between">
                {Array.from({ length: 4 }).map((_, lineIndex) => (
                  <div
                    key={lineIndex}
                    className="border-teal-gray-100 border-t"
                  />
                ))}
              </div>

              <div className="relative flex gap-1.5">
                {row.map((school) => (
                  <div
                    key={school.schoolId}
                    className="group relative flex w-15 shrink-0 flex-col items-center gap-1.25"
                  >
                    <div className="flex h-25 gap-1.25">
                      {PARTS.map((part) => {
                        const count = school.counts[part.key]
                        const applicant = school.applicants?.[part.key]
                        return (
                          <div
                            key={part.key}
                            className="relative h-full w-2.5 shrink-0"
                          >
                            {applicant !== undefined && (
                              <div
                                className="bg-teal-gray-150 absolute inset-x-0 bottom-0 rounded-t-[4px]"
                                style={{
                                  height: barHeightPx(applicant, globalMax),
                                }}
                              />
                            )}
                            <div
                              className="absolute inset-x-0 bottom-0 rounded-t-[4px]"
                              style={{
                                height: barHeightPx(count, globalMax),
                                background: barBackground(part),
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-body-2-medium text-teal-gray-900 h-10.5 w-full text-center break-keep">
                      {school.name}
                    </p>
                    {/* 세모 꼭지점을 학교 이름 라벨 바로 아래(컬럼 중앙)에 맞추고
                        본체는 아래로 내린다. */}
                    <GraphTooltip
                      name={school.name}
                      breakdown={toBreakdown(school)}
                      footerStatus={footerStatus}
                      className="top-full left-1/2 -translate-x-1/2"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

//  rounded-t-[4px]와 rounded-t-lg다름. 변경 X
