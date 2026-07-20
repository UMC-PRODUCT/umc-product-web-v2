import { createFileRoute, redirect } from "@tanstack/react-router"
import { useRef, useState } from "react"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import MoreVerticalIcon from "@/shared/assets/icon/more/MoreVerticalIcon"
import { useClickOutside } from "@/shared/hooks/useClickOutside"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"

import type { PartTag } from "@/shared/model/domain"

export const Route = createFileRoute("/projects/application/list")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const isVerified = sessionStorage.getItem("isApplicationVerified")
      if (isVerified !== "true") {
        throw redirect({ to: "/projects/application" })
      }
    }
  },
  component: ApplicationListPage,
})

interface DummyApplication {
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

function ApplicationListPage() {
  const [dummyApplications, setDummyApplications] = useState<
    DummyApplication[]
  >([
    {
      id: 1,
      name: "한양대학교 ERICA UMC 11기 정규 모집",
      submittedAt: "2026-07-11 23:35",
      result: "fail",
      roles: ["plan"],
      isClosed: true,
      period: "2026-06-15 00:00 ~ 2026-07-11 23:59",
    },
    {
      id: 2,
      name: "한양대학교 ERICA UMC 11기 2차 추가 모집",
      submittedAt: null,
      updatedAt: "2026-07-12 14:22",
      result: null,
      roles: ["design", "mobile-pe"],
      isClosed: true,
      period: "2026-07-12 00:00 ~ 2026-07-15 23:59",
    },
    {
      id: 3,
      name: "한양대학교 ERICA UMC 11기 3차 추가 모집",
      submittedAt: null,
      updatedAt: "2026-07-20 10:15",
      result: null,
      roles: ["web-pe", "plan"],
      isClosed: false,
      dDay: 10,
      period: "2026-07-16 00:00 ~ 2026-07-31 23:59",
    },
    {
      id: 4,
      name: "한양대학교 ERICA UMC 11기 4차 추가 모집",
      submittedAt: "2026-08-05 14:20",
      result: "pass",
      roles: ["springboot", "nodejs"],
      isClosed: true,
      period: "2026-08-01 00:00 ~ 2026-08-05 23:59",
    },
  ])

  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null)
  const activeDropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(
    activeDropdownRef,
    () => setActiveDropdownId(null),
    activeDropdownId !== null,
  )

  const handleDelete = (id: number) => {
    setDummyApplications((prev) => prev.filter((app) => app.id !== id))
  }

  return (
    <div className="flex w-full flex-col gap-8">
      {dummyApplications.map((app) => (
        <div key={app.id} className="flex w-full max-w-[960px] flex-col gap-2">
          <div className="flex flex-col gap-0.5 pl-4">
            <div className="flex items-center gap-3">
              {app.submittedAt ? (
                <div className="flex items-center gap-[7px]">
                  <span className="text-subtitle-3-semibold text-teal-600">
                    {app.submittedAt}
                  </span>
                  <span className="text-subtitle-3-semibold text-teal-600">
                    제출됨
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-[7px]">
                  <span className="text-subtitle-3-semibold text-teal-600">
                    {app.updatedAt}
                  </span>
                  <span className="text-subtitle-3-semibold text-teal-600">
                    임시 저장됨
                  </span>
                </div>
              )}
              {app.result === "fail" && (
                <div className="flex items-center gap-1.5">
                  <div className="bg-error-500 h-3 w-3 rounded-full" />
                  <span className="text-label-2-medium text-error-600">
                    불합격
                  </span>
                </div>
              )}
              {app.result === "pass" && (
                <div className="flex items-center gap-1.5">
                  <div className="bg-success-600 h-3 w-3 rounded-full" />
                  <span className="text-label-2-medium text-success-600">
                    합격
                  </span>
                </div>
              )}
            </div>

            {!app.submittedAt && app.isClosed && (
              <div className="text-teal-gray-500 text-body-2-medium flex items-center gap-1">
                <CheckIcon className="size-4" />
                <p>
                  모집 마감 전까지 제출하지 않아 지원이 완료되지 않았습니다.
                </p>
              </div>
            )}
            {!app.submittedAt && !app.isClosed && (
              <div className="text-teal-gray-500 text-body-2-medium flex items-center gap-1">
                <CheckIcon className="size-4" />
                <p>
                  아직 제출되지 않은 지원서입니다. 모집 마감 전까지 제출을
                  완료해 주세요.
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
                    {app.name}
                  </p>
                  <p className="text-body-2-regular text-teal-gray-500">
                    {app.period}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {app.roles.map((role) => (
                    <PartTagChip key={role} role={role} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex h-full flex-col items-end justify-between">
              {app.isClosed ? (
                <div className="bg-teal-gray-150 shadow-drop-neutral-3 rounded-[6px] px-2 py-0.5">
                  <span className="text-label-2-medium text-teal-gray-600">
                    모집 마감
                  </span>
                </div>
              ) : (
                <div className="shadow-drop-neutral-3 rounded-[6px] bg-teal-100 px-2 py-0.5">
                  <span className="text-label-2-medium text-teal-600">
                    모집 마감 {app.dDay !== undefined ? `D-${app.dDay}` : ""}
                  </span>
                </div>
              )}

              <div
                ref={activeDropdownId === app.id ? activeDropdownRef : null}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveDropdownId((prev) =>
                      prev === app.id ? null : app.id,
                    )
                  }
                  className="hover:bg-teal-gray-100 hover:shadow-inner-neutral-2 flex h-6.5 w-6.5 cursor-pointer items-center justify-center rounded-[8px]"
                >
                  <MoreVerticalIcon className="text-teal-gray-700 h-6 w-6" />
                </button>

                {activeDropdownId === app.id && (
                  <div
                    role="menu"
                    className="shadow-drop-neutral-1 absolute top-6.5 right-0 z-50 flex flex-col rounded-[10px] bg-white py-0.5"
                  >
                    {app.submittedAt ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdownId(null)
                        }}
                        className="hover:bg-teal-gray-50 flex h-10 w-35 cursor-pointer items-center rounded-[8px] bg-white px-3.5 text-left"
                      >
                        <span className="text-body-2-regular text-teal-gray-700 tracking-[-0.14px] whitespace-nowrap">
                          지원서 보기
                        </span>
                      </button>
                    ) : (
                      <>
                        {app.isClosed ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDropdownId(null)
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
                              setActiveDropdownId(null)
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
                            setActiveDropdownId(null)
                            handleDelete(app.id)
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
      ))}
    </div>
  )
}
