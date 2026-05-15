/** 피그마 기준 Project Card Lg입니다. */
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  getApplicationForm,
  mapApplicationFormToSections,
  projectKeys,
} from "@/features/project/new/api"
import { ProjectLogo } from "@/shared/assets/icon/logo/ProjectLogo"
import { Button } from "@/shared/ui/Button"
import { TeamMemberButton } from "@/shared/ui/button/TeamMemberButton"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import MemberCount from "@/shared/ui/MemberCount"
import { Modal } from "@/shared/ui/Modal"
import { useViewModeStore } from "@/shared/view-mode"

import { isRecruitDone } from "../model/matchingProject"
import { DEFAULT_MATCHING_PROJECT_MOCK } from "../model/matchingProject.mock"
import { resolveProjectDetailCtaMode } from "../model/projectDetailCta"
import { ProjectApplyModal } from "./apply-modal/ProjectApplyModal"
import { RecruitQuestionsViewModal } from "./apply-modal/RecruitQuestionsViewModal"
import { TeamMemberModal } from "./team-member-modal/TeamMemberModal"

import type { MatchingProject } from "../model/matchingProject"

type ProjectDetailCardLogo = "on" | "off"

interface ProjectDetailCardProps {
  data?: MatchingProject
  logo?: ProjectDetailCardLogo
  viewerBranch?: string
  showEditCta?: boolean
}

export function ProjectDetailCard({
  data: dataProp,
  logo = "on",
  viewerBranch: viewerBranchProp,
  showEditCta = false,
}: ProjectDetailCardProps) {
  const mode = useViewModeStore((s) => s.mode)
  const previewMode = useViewModeStore((s) => s.previewMode)
  const effectiveMode = mode === "admin" ? previewMode : mode
  const storeBranch = useViewModeStore((s) => s.viewerBranch)
  const viewerBranch = viewerBranchProp ?? storeBranch
  const addToast = useToastStore((s) => s.addToast)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [isRecruitQuestionsModalOpen, setIsRecruitQuestionsModalOpen] =
    useState(false)
  const data = dataProp ?? DEFAULT_MATCHING_PROJECT_MOCK

  const projectIdNum = /^\d+$/.test(data.id) ? Number(data.id) : NaN
  const isShowingFormModal = isApplyModalOpen || isRecruitQuestionsModalOpen
  const {
    data: applicationForm,
    isLoading: isFormLoading,
    error: formError,
  } = useQuery({
    queryKey: projectKeys.applicationForm(projectIdNum),
    queryFn: () => getApplicationForm(projectIdNum),
    enabled: isShowingFormModal && Number.isFinite(projectIdNum),
    staleTime: 5 * 60 * 1000,
  })
  const sections = useMemo(
    () =>
      applicationForm ? mapApplicationFormToSections(applicationForm) : [],
    [applicationForm],
  )

  useEffect(() => {
    if (!formError) return
    addToast({
      message: "모집 문항을 불러오지 못했습니다.",
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3,
    })
    setIsApplyModalOpen(false)
    setIsRecruitQuestionsModalOpen(false)
  }, [formError, addToast])
  // admin 드롭다운 프리뷰는 실제 지부 비교 없이 항상 "같은 지부"로 간주 (임시)
  const isSameBranch = mode === "admin" || viewerBranch === data.branch
  const ctaMode = resolveProjectDetailCtaMode(
    effectiveMode,
    isSameBranch,
    data.isApplied ?? false,
  )
  const cover = data.coverImage
  const showLogo = logo === "on"

  return (
    <>
      <div className="flex w-[33.75rem] flex-col items-start overflow-hidden rounded-2xl bg-white">
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
                    <ProjectLogo />
                    <h2 className="text-heading-6-semibold text-teal-gray-900 line-clamp-1 w-60 min-w-0">
                      {data.title}
                    </h2>
                  </div>
                ) : (
                  <h2 className="text-heading-6-semibold text-teal-gray-900 w-60 min-w-0">
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
                const done = isRecruitDone(row)
                return (
                  <div
                    key={row.part}
                    className="flex w-full items-center justify-between"
                  >
                    <div className="flex w-[7.625rem] items-center justify-between">
                      <span className="text-body-2-medium text-teal-gray-700">
                        {row.part}
                      </span>
                      <MemberCount
                        size="sm"
                        current={row.current}
                        total={row.total}
                      />
                    </div>
                    <RecruitStatusChip done={done} />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-8.5 flex w-full items-start gap-2.5">
            <TeamMemberButton
              variant="weak"
              onClick={() => setIsTeamModalOpen(true)}
            />
            <Button variant="weak" color="primary" className="flex-1">
              기획 보기
            </Button>
            {showEditCta ? (
              <Button className="flex-1">프로젝트 수정하기</Button>
            ) : (
              <>
                {ctaMode === "recruit-questions" && (
                  <Button
                    className="flex-1"
                    onClick={() => setIsRecruitQuestionsModalOpen(true)}
                  >
                    모집 문항 보기
                  </Button>
                )}
                {ctaMode === "my-application" && (
                  <Button className="flex-1">내 지원서 확인하기</Button>
                )}
                {ctaMode === "apply" && (
                  <Button
                    className="flex-1"
                    onClick={() => setIsApplyModalOpen(true)}
                  >
                    지원하기
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Modal.Root open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content>
            <TeamMemberModal onClose={() => setIsTeamModalOpen(false)} />
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <Modal.Root
        open={isRecruitQuestionsModalOpen}
        onOpenChange={setIsRecruitQuestionsModalOpen}
      >
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content className="shadow-drop-neutral-3 rounded-2xl">
            {isFormLoading ? (
              <div className="flex h-40 w-232 items-center justify-center rounded-b-2xl bg-white">
                <span className="text-body-2-regular text-teal-gray-500">
                  불러오는 중...
                </span>
              </div>
            ) : applicationForm == null ? (
              <div className="flex h-40 w-232 items-center justify-center rounded-b-2xl bg-white">
                <span className="text-body-2-regular text-teal-gray-500">
                  등록된 모집 문항이 없습니다.
                </span>
              </div>
            ) : (
              <RecruitQuestionsViewModal data={data} sections={sections} />
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <Modal.Root open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content className="shadow-drop-neutral-3 rounded-2xl">
            {isFormLoading ? (
              <div className="flex h-40 w-232 items-center justify-center rounded-b-2xl bg-white">
                <span className="text-body-2-regular text-teal-gray-500">
                  불러오는 중...
                </span>
              </div>
            ) : applicationForm == null ? (
              <div className="flex h-40 w-232 items-center justify-center rounded-b-2xl bg-white">
                <span className="text-body-2-regular text-teal-gray-500">
                  등록된 지원 양식이 없습니다.
                </span>
              </div>
            ) : (
              <ProjectApplyModal
                data={data}
                sections={sections}
                canToggleSection={effectiveMode !== "others"}
                onBack={() => setIsApplyModalOpen(false)}
                onSubmit={(answers) => {
                  console.log("[apply submit]", data.id, answers)
                  setIsApplyModalOpen(false)
                }}
              />
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}
