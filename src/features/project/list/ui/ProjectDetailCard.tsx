/** 피그마 기준 Project Card Lg입니다. */
/** 임시이며, 리팩토링 예정 */
import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import { cn } from "@/shared/lib/utils"

import {
  DEFAULT_MATCHING_PROJECT_MOCK,
  type MatchingProjectMock,
} from "../model/matchingProject.mock"

type ProjectDetailCardLogo = "on" | "off"

interface ProjectDetailCardProps {
  data?: MatchingProjectMock
  logo?: ProjectDetailCardLogo
}

function RecruitStatusChip({ done }: { done?: boolean }) {
  return (
    <span
      className={cn(
        "text-label-3-semibold flex items-center justify-center rounded-md px-2 py-0 text-center",
        done
          ? "bg-teal-gray-150 text-teal-gray-600"
          : "bg-teal-100 text-teal-600",
      )}
    >
      {done ? "모집 완료" : "모집 중"}
    </span>
  )
}

function ProfileActionButton() {
  return (
    <button
      type="button"
      className="bg-teal-gray-150 text-teal-gray-600 flex h-11 min-h-[2.75rem] min-w-[3.25rem] items-center justify-center rounded-xl px-4 py-1"
      aria-label="프로필 보기"
    >
      <svg
        width={20}
        height={22}
        viewBox="0 0 20 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle
          cx={10}
          cy={5}
          r={4.25}
          stroke="currentColor"
          strokeWidth={1.5}
        />
        <path
          d="M2.35254 21.25H17.6475C18.0314 21.2499 18.4284 21.0726 18.7412 20.707C19.0572 20.3377 19.25 19.8149 19.25 19.25V19.0967L19.249 19.0732C19.2484 19.0607 19.248 19.0477 19.248 19.0352C19.248 19.0347 19.2481 19.0336 19.248 19.0322C19.248 19.03 19.2472 19.0265 19.2471 19.0225C19.2468 19.0142 19.246 19.0033 19.2451 18.9893C19.2433 18.9603 19.2406 18.9224 19.2363 18.875C19.1183 17.6631 18.7486 16.5099 18.166 15.5156C17.6488 14.6418 16.8507 13.7109 15.5811 12.9941C14.3101 12.2767 12.5253 11.75 10 11.75C7.47467 11.75 5.68984 12.2764 4.41895 12.9941C3.30793 13.6216 2.55764 14.4131 2.04102 15.1875L1.83398 15.5176C1.25165 16.5113 0.882019 17.6638 0.763672 18.875L0.75 19.0654V19.25C0.75 19.8149 0.942846 20.3377 1.25879 20.707C1.57158 21.0726 1.96863 21.2499 2.35254 21.25Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export function ProjectDetailCard({
  data: dataProp,
  logo = "on",
}: ProjectDetailCardProps) {
  const data = dataProp ?? DEFAULT_MATCHING_PROJECT_MOCK
  const cover = data.coverImage
  const showLogo = logo === "on"

  return (
    <div className="flex w-[33.75rem] flex-col items-start rounded-xl bg-white">
      <div className="bg-teal-gray-200 flex h-[17.875rem] w-[33.75rem] items-center justify-center overflow-hidden">
        {cover?.src ? (
          <img
            src={cover.src}
            alt={cover.alt ?? `${data.title} 대표 이미지`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="text-body-2-regular text-teal-gray-400 text-center">
            프로젝트 대표 이미지
            <br />
            540*286
          </div>
        )}
      </div>

      <div className="flex w-full flex-col items-start p-5">
        <div className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full flex-col items-start gap-2.5">
            <div className="flex w-full items-center justify-between gap-4">
              {showLogo ? (
                <div className="flex min-w-0 items-center gap-2">
                  <div className="bg-teal-gray-200 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    <ProfileIcon className="text-teal-gray-400 h-6 w-6" />
                  </div>
                  <h2 className="text-heading-5-semibold text-teal-gray-900 line-clamp-1 w-60 min-w-0">
                    {data.title}
                  </h2>
                </div>
              ) : (
                <h2 className="text-heading-5-semibold text-teal-gray-900 w-60 min-w-0">
                  {data.title}
                </h2>
              )}

              <p className="text-body-2-regular text-teal-gray-500 shrink-0 text-right">
                {data.authorSchoolLine}
              </p>
            </div>

            <p className="text-body-2-regular text-teal-gray-600 w-full break-words whitespace-pre-wrap">
              {data.description}
            </p>
          </div>

          <div className="flex w-full flex-col items-start gap-1.5">
            {data.recruitRows.map((row) => {
              const done =
                row.done ?? (row.total > 0 && row.current >= row.total)
              return (
                <div
                  key={row.part}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex w-[7.625rem] items-center justify-between">
                    <span className="text-body-2-medium text-teal-gray-700">
                      {row.part}
                    </span>
                    <span className="text-body-2-medium text-teal-gray-500 tabular-nums">
                      {row.current}/{row.total}
                    </span>
                  </div>
                  <RecruitStatusChip done={done} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex w-full items-start gap-2.5">
          <ProfileActionButton />
          <button
            type="button"
            className="text-label-1-medium flex h-11 min-h-[2.75rem] min-w-[5.625rem] items-center justify-center rounded-xl bg-teal-100 px-4 py-1 text-center text-teal-600"
          >
            기획 보기
          </button>
          <button
            type="button"
            className="text-label-1-medium flex h-11 min-h-[2.75rem] min-w-[5.625rem] items-center justify-center rounded-xl bg-teal-600 px-4 py-1 text-center text-white"
          >
            모집 문항 보기
          </button>
        </div>
      </div>
    </div>
  )
}
