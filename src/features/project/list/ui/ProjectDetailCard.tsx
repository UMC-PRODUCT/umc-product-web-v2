/** 피그마 기준 Project Card Lg입니다. */
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { useMe } from "@/features/auth/hooks/useMe"
import { isCurrentTermPm, isOperator } from "@/features/auth/model/identity"
import {
  getApplicationForm,
  mapApplicationFormToSections,
  projectKeys,
} from "@/features/project/new/api"
import { getActiveGisu } from "@/shared/api/gisu"
import { ProjectLogo } from "@/shared/assets/icon/logo/ProjectLogo"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"
import { Button } from "@/shared/ui/Button"
import { TeamMemberButton } from "@/shared/ui/button/TeamMemberButton"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import MemberCount from "@/shared/ui/MemberCount"
import { Modal } from "@/shared/ui/Modal"

import {
  getActiveMatchingRound,
  getMyApplications,
  getProjectDetail,
} from "../api/matchingProject"
import { isRecruitDone } from "../model/matchingProject"
import { DEFAULT_MATCHING_PROJECT_MOCK } from "../model/matchingProject.mock"
import { resolveProjectDetailCtaMode } from "../model/projectDetailCta"
import { ProjectApplyModal } from "./apply-modal/ProjectApplyModal"
import { RecruitQuestionsViewModal } from "./apply-modal/RecruitQuestionsViewModal"
import { TeamMemberModal } from "./team-member-modal/TeamMemberModal"

import type { ProjectDetail } from "../api/matchingProject"
import type {
  MatchingProject,
  ProjectCoverImage,
} from "../model/matchingProject"

type ProjectDetailCardLogo = "on" | "off"

interface ProjectDetailCardProps {
  projectId: number | string
  logo?: ProjectDetailCardLogo
  showEditCta?: boolean
}

function ProjectDetailCardSkeleton() {
  return (
    <div className="flex w-[33.75rem] flex-col items-start overflow-hidden rounded-2xl bg-white">
      <div className="bg-teal-gray-200 h-[17.875rem] w-[33.75rem] animate-pulse" />
      <div className="flex w-full flex-col items-start p-5">
        <div className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full flex-col items-start gap-2.5">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="bg-teal-gray-150 h-6 w-52 animate-pulse rounded-md" />
              <div className="bg-teal-gray-150 h-4 w-32 animate-pulse rounded-md" />
            </div>
            <div className="flex w-full flex-col gap-1.5">
              <div className="bg-teal-gray-150 h-4 w-full animate-pulse rounded-md" />
              <div className="bg-teal-gray-150 h-4 w-4/5 animate-pulse rounded-md" />
              <div className="bg-teal-gray-150 h-4 w-2/3 animate-pulse rounded-md" />
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex w-full items-center justify-between">
                <div className="bg-teal-gray-150 h-4 w-28 animate-pulse rounded-md" />
                <div className="bg-teal-gray-150 h-6 w-14 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8.5 flex w-full items-start gap-2.5">
          <div className="bg-teal-gray-150 h-11 w-11 animate-pulse rounded-xl" />
          <div className="bg-teal-gray-150 h-11 flex-1 animate-pulse rounded-xl" />
          <div className="bg-teal-gray-150 h-11 flex-1 animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function toMatchingProject(detail: ProjectDetail): MatchingProject {
  const owner = detail.productOwner
  const authorSchoolLine = [
    owner.nickname && owner.name
      ? `${owner.nickname}/${owner.name}`
      : (owner.name ?? ""),
    formatSchoolName(owner.schoolName),
  ]
    .filter(Boolean)
    .join(" · ")

  return {
    id: String(detail.id),
    branch: "",
    school: owner.schoolName,
    title: detail.name,
    description: detail.description,
    authorSchoolLine,
    coverImage: detail.thumbnailImageUrl
      ? { src: detail.thumbnailImageUrl }
      : null,
    recruitRows: detail.partQuotas.map((q) => ({
      part: q.part,
      current: q.currentCount,
      total: q.quota,
      done: q.status === "COMPLETED",
    })),
  }
}

export function ProjectDetailCard({
  projectId: projectIdProp,
  logo = "on",
  showEditCta = false,
}: ProjectDetailCardProps) {
  const projectId = Number(projectIdProp)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: me } = useMe()
  const addToast = useToastStore((s) => s.addToast)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [isRecruitQuestionsModalOpen, setIsRecruitQuestionsModalOpen] =
    useState(false)
  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: ["projectDetail", projectId],
    queryFn: () => getProjectDetail(projectId),
    staleTime: 5 * 60 * 1000,
  })

  const { data: activeGisuId } = useQuery({
    queryKey: ["gisu", "active"],
    queryFn: async () => {
      const res = await getActiveGisu()
      return res.gisuId ?? null
    },
  })

  const userIsOperator = isOperator(me)
  const userIsPm = isCurrentTermPm(me)

  const { data: myApplications } = useQuery({
    queryKey: ["myApplications", activeGisuId],
    queryFn: () => getMyApplications(activeGisuId!),
    enabled: activeGisuId != null && !userIsOperator && !userIsPm,
  })

  const myChapterId = useMemo(() => {
    const records = me?.challengerRecords
    if (!records?.length) return null
    const id = [...records].sort(
      (a, b) => Number(b.gisuId) - Number(a.gisuId),
    )[0]?.chapterId
    return id != null ? Number(id) : null
  }, [me])

  const isApplied =
    myApplications?.some((a) => Number(a.projectId) === projectId) ?? false

  const data = detail
    ? toMatchingProject(detail)
    : DEFAULT_MATCHING_PROJECT_MOCK

  const isShowingFormModal = isApplyModalOpen || isRecruitQuestionsModalOpen
  const {
    data: applicationForm,
    isLoading: isFormLoading,
    error: formError,
  } = useQuery({
    queryKey: projectKeys.applicationForm(projectId),
    queryFn: () => getApplicationForm(projectId),
    enabled: isShowingFormModal,
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

  const isSameBranch = !userIsOperator
  const ctaMode = resolveProjectDetailCtaMode(
    userIsOperator,
    userIsPm,
    isSameBranch,
    isApplied,
  )

  const { data: activeMatchingRound } = useQuery({
    queryKey: ["activeMatchingRound", myChapterId],
    queryFn: () => getActiveMatchingRound(myChapterId!),
    enabled: myChapterId != null && ctaMode === "apply",
    staleTime: 60 * 1000,
  })

  const cover: ProjectCoverImage | null = detail?.thumbnailImageUrl
    ? { src: detail.thumbnailImageUrl }
    : null
  const showLogo = logo === "on"

  if (isDetailLoading) {
    return <ProjectDetailCardSkeleton />
  }

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
            <Button
              variant="weak"
              color="primary"
              className="flex-1"
              disabled={!detail?.externalLink}
              onClick={() => {
                if (detail?.externalLink)
                  window.open(
                    detail.externalLink,
                    "_blank",
                    "noopener,noreferrer",
                  )
              }}
            >
              기획 보기
            </Button>
            {showEditCta ? (
              <Button
                className="flex-1"
                onClick={() =>
                  navigate({
                    to: "/matching/projects/new",
                    search: { projectId },
                  })
                }
              >
                프로젝트 수정하기
              </Button>
            ) : (
              <>
                {ctaMode === "recruit-questions" && (
                  <Button
                    className="flex-1"
                    isLoading={isDetailLoading}
                    disabled={!isDetailLoading && !detail?.applicationFormId}
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
                    onClick={() => {
                      if (!activeMatchingRound) {
                        addToast({
                          message: "매칭 기간이 아닙니다!",
                          color: "red",
                          variant: "deep",
                          type: "default",
                          duration: 3000,
                        })
                        return
                      }
                      setIsApplyModalOpen(true)
                    }}
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
            <Modal.Title className="sr-only">팀원 구성</Modal.Title>
            <TeamMemberModal
              projectId={projectId}
              recruitRows={data.recruitRows}
              onClose={() => setIsTeamModalOpen(false)}
            />
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
                projectId={projectId}
                matchingRoundId={activeMatchingRound!.id}
                sections={sections}
                canToggleSection={userIsOperator || userIsPm}
                onBack={() => setIsApplyModalOpen(false)}
                onSubmitSuccess={() => {
                  setIsApplyModalOpen(false)
                  void queryClient.invalidateQueries({
                    queryKey: ["myApplications", activeGisuId],
                  })
                }}
              />
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}
