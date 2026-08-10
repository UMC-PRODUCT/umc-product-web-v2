import { useNavigate } from "@tanstack/react-router"
import { useRef, useState } from "react"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { MoreVerticalGlyph } from "@/shared/assets/icon/more/MoreVerticalIcon"
import { useClickOutside } from "@/shared/hooks/useClickOutside"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import type { PartTag } from "@/shared/model/domain"

export interface RecruitingApplication {
  id: number
  name: string
  isSubmitted?: boolean
  submittedAt?: string | null
  updatedAt?: string | null
  result?: "pass" | "fail" | null
  roles: PartTag[]
  isClosed: boolean
  dDay?: number
  period?: string | null
}

interface RecruitingApplicationCardProps {
  application: RecruitingApplication
  onDelete: (id: number) => void
}

export function RecruitingApplicationCard({
  application,
  onDelete,
}: RecruitingApplicationCardProps) {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false), isDropdownOpen)

  const isSubmitted =
    application.isSubmitted ?? Boolean(application.submittedAt)

  // 모달 내용 조건 분기 (사용자가 직접 채워 넣을 수 있도록 조건 분기 구성)
  const getDeleteModalProps = () => {
    // 1) 제출한 지원서를 모집 기간 내에 삭제할 때
    if (isSubmitted && !application.isClosed) {
      return {
        title: "지원서를 삭제하시겠습니까?",
        content: (
          <span className="block w-full break-keep">
            삭제하면 {application.name}의 지원이 취소됩니다.
            <br />
            삭제한 지원서는 복구할 수 없습니다.
          </span>
        ),
      }
    }

    // 2) 임시저장한 지원서를 모집 기간 내에 삭제할 때
    if (!isSubmitted && !application.isClosed) {
      return {
        title: "임시 저장한 지원서를 삭제하시겠습니까?",
        content: (
          <span className="block w-full break-keep">
            임시 저장한 지원서가 삭제됩니다.
            <br />
            모집 마감 전까지 새 지원서를 작성할 수 있습니다.
            <br />
            삭제한 지원서는 복구할 수 없습니다.
          </span>
        ),
      }
    }

    // 3) 임시저장한 지원서를 모집 기간 외에 삭제할 때 (마감 이후)
    if (!isSubmitted && application.isClosed) {
      return {
        title: "임시 저장한 지원서를 삭제하시겠습니까?",
        content: (
          <span className="block w-full break-keep">
            임시 저장한 지원서가 삭제됩니다. <br />
            <span className="text-error-600">
              모집이 마감되어 다시 제출할 수 없습니다.
            </span>
            <br />
            삭제한 지원서는 복구할 수 없습니다.
          </span>
        ),
      }
    }

    // 기본 폴백
    return {
      title: "지원서 삭제",
      content: "지원서를 삭제하시겠습니까?",
    }
  }

  const deleteModalProps = getDeleteModalProps()

  const handleNavigateDetail = () => {
    navigate({
      to: "/projects/application/$applicationId",
      params: { applicationId: String(application.id) },
    })
  }

  return (
    <>
      <div className="flex w-full max-w-[960px] flex-col gap-2">
        <div className="flex flex-col gap-0.5 pl-4">
          <div className="flex items-center gap-3">
            {isSubmitted ? (
              <div className="flex items-center gap-[7px]">
                {application.submittedAt &&
                  application.submittedAt !== "제출 완료" && (
                    <span className="text-subtitle-3-semibold text-teal-600">
                      {application.submittedAt}
                    </span>
                  )}
                <span className="text-subtitle-3-semibold text-teal-600">
                  제출됨
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-[7px]">
                {application.updatedAt &&
                  application.updatedAt !== "임시 저장됨" && (
                    <span className="text-subtitle-3-semibold text-teal-600">
                      {application.updatedAt}
                    </span>
                  )}
                <span className="text-subtitle-3-semibold text-teal-600">
                  임시 저장됨
                </span>
              </div>
            )}
            {application.result === "fail" && (
              <div className="flex items-center gap-1.5">
                <div className="bg-error-500 h-3 w-3 rounded-full" />
                <span className="text-label-2-medium text-error-600">
                  불합격
                </span>
              </div>
            )}
            {application.result === "pass" && (
              <div className="flex items-center gap-1.5">
                <div className="bg-success-600 h-3 w-3 rounded-full" />
                <span className="text-label-2-medium text-success-600">
                  합격
                </span>
              </div>
            )}
          </div>

          {!isSubmitted && application.isClosed && (
            <div className="text-teal-gray-500 text-body-2-medium flex items-center gap-1">
              <CheckIcon className="size-4" />
              <p>모집 마감 전까지 제출하지 않아 지원이 완료되지 않았습니다.</p>
            </div>
          )}
          {!isSubmitted && !application.isClosed && (
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
                {application.period && application.period.trim() !== "" && (
                  <p className="text-body-2-regular text-teal-gray-500">
                    {application.period}
                  </p>
                )}
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
              <div className="bg-teal-gray-150 shadow-drop-neutral-3 rounded-[0.375rem] px-2 py-0.5">
                <span className="text-label-2-medium text-teal-gray-600">
                  모집 마감
                </span>
              </div>
            ) : (
              <div className="shadow-drop-neutral-3 rounded-[0.375rem] bg-teal-100 px-2 py-0.5">
                <span className="text-label-2-medium text-teal-600">
                  모집 마감{" "}
                  {application.dDay !== undefined
                    ? `D-${application.dDay}`
                    : ""}
                </span>
              </div>
            )}

            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-label="지원서 메뉴"
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
                className="hover:bg-teal-gray-100 hover:shadow-inner-neutral-2 flex h-6.5 w-6.5 cursor-pointer items-center justify-center rounded-[8px]"
              >
                <MoreVerticalGlyph className="text-teal-gray-700 h-6 w-6" />
              </button>

              {isDropdownOpen && (
                <div
                  role="menu"
                  className="shadow-drop-neutral-1 absolute top-6.5 right-0 z-50 flex flex-col rounded-[10px] bg-white py-0.5"
                >
                  {isSubmitted ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false)
                          handleNavigateDetail()
                        }}
                        className="hover:bg-teal-gray-50 flex h-10 w-35 cursor-pointer items-center rounded-[8px] bg-white px-3.5 text-left"
                      >
                        <span className="text-body-2-regular text-teal-gray-700 tracking-[-0.14px] whitespace-nowrap">
                          지원서 보기
                        </span>
                      </button>
                      {!application.isClosed && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false)
                            setIsDeleteModalOpen(true)
                          }}
                          className="hover:bg-teal-gray-50 flex h-10 w-35 cursor-pointer items-center rounded-[8px] bg-white px-3.5 text-left"
                        >
                          <span className="text-body-2-regular text-error-500 tracking-[-0.14px] whitespace-nowrap">
                            삭제
                          </span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {application.isClosed ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false)
                            handleNavigateDetail()
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
                            handleNavigateDetail()
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
                          setIsDeleteModalOpen(true)
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

      <CtaModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title={deleteModalProps.title}
        content={deleteModalProps.content}
        cancelText="돌아가기"
        confirmText="삭제하기"
        variant="warning"
        onConfirm={() => {
          setIsDeleteModalOpen(false)
          onDelete(application.id)
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  )
}
