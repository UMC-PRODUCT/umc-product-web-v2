import { useRef, useState } from "react"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import MoreVerticalIcon from "@/shared/assets/icon/more/MoreVerticalIcon"
import { useClickOutside } from "@/shared/hooks/useClickOutside"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"

import type { PartTag } from "@/shared/model/domain"

export interface RecruitingApplication {
  id: number
  name: string
  submittedAt?: string | null
  updatedAt?: string | null
  result?: "pass" | "fail" | null
  roles: PartTag[]
  isClosed: boolean
  dDay?: number
  period: string
}

interface RecruitingApplicationCardProps {
  application: RecruitingApplication
  onDelete: (id: number) => void
}

export function RecruitingApplicationCard({
  application,
  onDelete,
}: RecruitingApplicationCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false), isDropdownOpen)

  return (
    <div className="flex w-full max-w-[960px] flex-col gap-2">
      <div className="flex flex-col gap-0.5 pl-4">
        <div className="flex items-center gap-3">
          {application.submittedAt ? (
            <div className="flex items-center gap-[7px]">
              <span className="text-subtitle-3-semibold text-teal-600">
                {application.submittedAt}
              </span>
              <span className="text-subtitle-3-semibold text-teal-600">
                제출됨
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-[7px]">
              <span className="text-subtitle-3-semibold text-teal-600">
                {application.updatedAt}
              </span>
              <span className="text-subtitle-3-semibold text-teal-600">
                임시 저장됨
              </span>
            </div>
          )}
          {application.result === "fail" && (
            <div className="flex items-center gap-1.5">
              <div className="bg-error-500 h-3 w-3 rounded-full" />
              <span className="text-label-2-medium text-error-600">불합격</span>
            </div>
          )}
          {application.result === "pass" && (
            <div className="flex items-center gap-1.5">
              <div className="bg-success-600 h-3 w-3 rounded-full" />
              <span className="text-label-2-medium text-success-600">합격</span>
            </div>
          )}
        </div>

        {!application.submittedAt && application.isClosed && (
          <div className="text-teal-gray-500 text-body-2-medium flex items-center gap-1">
            <CheckIcon className="size-4" />
            <p>모집 마감 전까지 제출하지 않아 지원이 완료되지 않았습니다.</p>
          </div>
        )}
        {!application.submittedAt && !application.isClosed && (
          <div className="text-teal-gray-500 text-body-2-medium flex items-center gap-1">
            <CheckIcon className="size-4" />
            <p>
              아직 제출되지 않은 지원서입니다. 모집 마감 전까지 제출을 완료해
              주세요.
            </p>
          </div>
        )}
      </div>

      <div className="group border-teal-gray-100 shadow-drop-neutral-2 flex h-32 w-full items-center justify-between rounded-[16px] border bg-white py-5 pr-5 pl-4">
        <div className="flex gap-4">
          <div className="h-12.5 w-12.5 rounded-full bg-black" />

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-heading-7-semibold text-teal-900 group-hover:text-teal-500">
                {application.name}
              </p>
              <p className="text-body-2-regular text-teal-gray-500">
                {application.period}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {application.roles.map((role) => (
                <PartTagChip key={role} role={role} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex h-full flex-col items-end justify-between">
          {application.isClosed ? (
            <div className="bg-teal-gray-150 shadow-drop-neutral-3 rounded-[6px] px-2 py-0.5">
              <span className="text-label-2-medium text-teal-gray-600">
                모집 마감
              </span>
            </div>
          ) : (
            <div className="shadow-drop-neutral-3 rounded-[6px] bg-teal-100 px-2 py-0.5">
              <span className="text-label-2-medium text-teal-600">
                모집 마감{" "}
                {application.dDay !== undefined ? `D-${application.dDay}` : ""}
              </span>
            </div>
          )}

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="hover:bg-teal-gray-100 hover:shadow-inner-neutral-2 flex h-6.5 w-6.5 cursor-pointer items-center justify-center rounded-[8px]"
            >
              <MoreVerticalIcon className="text-teal-gray-700 h-6 w-6" />
            </button>

            {isDropdownOpen && (
              <div
                role="menu"
                className="shadow-drop-neutral-1 absolute top-6.5 right-0 z-50 flex flex-col rounded-[10px] bg-white py-0.5"
              >
                {application.submittedAt ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false)
                    }}
                    className="hover:bg-teal-gray-50 flex h-10 w-35 cursor-pointer items-center rounded-[8px] bg-white px-3.5 text-left"
                  >
                    <span className="text-body-2-regular text-teal-gray-700 tracking-[-0.14px] whitespace-nowrap">
                      지원서 보기
                    </span>
                  </button>
                ) : (
                  <>
                    {application.isClosed ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false)
                        }}
                        className="hover:bg-teal-gray-50 flex h-10 w-35 cursor-pointer items-center rounded-[8px] bg-white px-3.5 text-left"
                      >
                        <span className="text-body-2-regular text-teal-gray-700 tracking-[-0.14px] whitespace-nowrap">
                          지원서 보기
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false)
                        }}
                        className="hover:bg-teal-gray-50 flex h-10 w-35 cursor-pointer items-center rounded-[8px] bg-white px-3.5 text-left"
                      >
                        <span className="text-body-2-regular text-teal-gray-700 tracking-[-0.14px] whitespace-nowrap">
                          수정하기
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false)
                        onDelete(application.id)
                      }}
                      className="hover:bg-teal-gray-50 flex h-10 w-35 cursor-pointer items-center rounded-[8px] bg-white px-3.5 text-left"
                    >
                      <span className="text-body-2-regular text-error-500 tracking-[-0.14px] whitespace-nowrap">
                        삭제
                      </span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
