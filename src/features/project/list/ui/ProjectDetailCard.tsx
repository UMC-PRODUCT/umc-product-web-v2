/** 피그마 기준 Project Card Lg입니다. */
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { useMe } from "@/features/auth/hooks/useMe"
import { useResourcePermission } from "@/features/auth/hooks/useResourcePermission"
import { isCurrentTermPm, isOperator } from "@/features/auth/model/identity"
import { useProjectPermissions } from "@/features/project/hooks/useProjectPermissions"
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
import { ApplyFormSkeleton } from "./apply-modal/ApplyFormSkeleton"
import { MyApplicationModal } from "./apply-modal/MyApplicationModal"
import { ProjectApplyModal } from "./apply-modal/ProjectApplyModal"
import { RecruitQuestionsViewModal } from "./apply-modal/RecruitQuestionsViewModal"
import { TeamMemberModal } from "./team-member-modal/TeamMemberModal"

import type { ActiveMatchingRound, ProjectDetail } from "../api/matchingProject"
import type {
  MatchingProject,
  ProjectCoverImage,
} from "../model/matchingProject"

type ProjectDetailCardLogo = "on" | "off"

interface ProjectDetailCardProps {
  projectId: number | string
  logo?: ProjectDetailCardLogo
  showEditCta?: boolean
  canEditProject?: boolean
  editPermissionLoading?: boolean
  /** 프로젝트가 속한 지부 ID. 제공 시 본인 지부 일치 여부를 실제 비교 */
  projectChapterId?: number
  /** 매칭현황 등 조회 전용 컨텍스트. PM/Others는 기획 보기만 노출 */
  viewOnly?: boolean
  /** 랜덤 매칭 항목: 내 지원서 보기 버튼 미노출 */
  hideMyApplication?: boolean
}

function ProjectDetailCardSkeleton() {
  return (
    <div className="flex w-135 flex-col items-start overflow-hidden rounded-2xl bg-white">
      <div className="bg-teal-gray-200 h-71.5 w-135 animate-pulse" />
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

const PART_LABEL: Record<string, string> = {
  PLAN: "기획",
  DESIGN: "Design",
  WEB: "Web",
  IOS: "iOS",
  ANDROID: "Android",
  SPRINGBOOT: "SpringBoot",
  NODEJS: "Node.js",
}
const PART_ORDER = Object.keys(PART_LABEL)

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
    recruitRows: [...detail.partQuotas]
      .sort((a, b) => {
        const ai = PART_ORDER.indexOf(a.part)
        const bi = PART_ORDER.indexOf(b.part)
        return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
      })
      .map((q) => ({
        part: PART_LABEL[q.part] ?? q.part,
        current: Number(q.currentCount) || 0,
        total: Number(q.quota) || 0,
        done: q.status === "COMPLETED",
      })),
    externalLink: detail.externalLink,
  }
}

export function ProjectDetailCard({
  projectId: projectIdProp,
  logo = "on",
  showEditCta = false,
  canEditProject,
  editPermissionLoading,
  projectChapterId,
  viewOnly = false,
  hideMyApplication = false,
}: ProjectDetailCardProps) {
  const projectId = Number(projectIdProp)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: me } = useMe()
  const addToast = useToastStore((s) => s.addToast)
  const userIsOperator = isOperator(me)
  const userIsPm = isCurrentTermPm(me)
  const shouldQueryEditPermission =
    showEditCta && canEditProject === undefined && Number.isFinite(projectId)
  const projectPermissionsQuery = useProjectPermissions(projectId, {
    enabled: shouldQueryEditPermission,
  })
  const shouldQueryApplicationWritePermission =
    !showEditCta &&
    Number.isFinite(projectId) &&
    me !== undefined &&
    !userIsOperator &&
    !userIsPm
  const applicationWritePermissionQuery = useResourcePermission(
    "PROJECT_APPLICATION",
    projectId,
    {
      enabled: shouldQueryApplicationWritePermission,
      permissionType: "WRITE",
    },
  )
  const resolvedCanEditProject =
    canEditProject ?? projectPermissionsQuery.canEdit
  const resolvedEditPermissionLoading =
    editPermissionLoading ??
    (shouldQueryEditPermission && projectPermissionsQuery.isPending)
  const canWriteProjectApplication =
    applicationWritePermissionQuery.hasPermission("WRITE")
  const isApplicationWritePermissionLoading =
    shouldQueryApplicationWritePermission &&
    applicationWritePermissionQuery.isPending
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [isMyApplicationModalOpen, setIsMyApplicationModalOpen] =
    useState(false)
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

  const myApplicationForProject = myApplications?.find(
    (a) => Number(a.projectId) === projectId && a.status !== "CANCELLED",
  )
  const isApplied = myApplicationForProject != null

  const isAlreadyApproved =
    myApplications?.some((a) => a.status === "APPROVED") ?? false

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

  const [minSkeletonElapsed, setMinSkeletonElapsed] = useState(false)
  useEffect(() => {
    if (!isShowingFormModal) {
      setMinSkeletonElapsed(false)
      return
    }
    const timer = setTimeout(() => setMinSkeletonElapsed(true), 1000)
    return () => clearTimeout(timer)
  }, [isShowingFormModal])

  const showFormSkeleton = isFormLoading || !minSkeletonElapsed
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
      duration: 3000,
    })
    setIsApplyModalOpen(false)
    setIsRecruitQuestionsModalOpen(false)
  }, [formError, addToast])

  useEffect(() => {
    if (
      !isShowingFormModal ||
      isFormLoading ||
      applicationForm ||
      !minSkeletonElapsed
    )
      return
    addToast({
      message: "등록된 지원 양식이 없습니다.",
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
    setIsApplyModalOpen(false)
    setIsRecruitQuestionsModalOpen(false)
  }, [
    isShowingFormModal,
    isFormLoading,
    applicationForm,
    minSkeletonElapsed,
    addToast,
  ])

  const isSameBranch = userIsOperator
    ? true
    : projectChapterId != null && myChapterId != null
      ? projectChapterId === myChapterId
      : true
  const isChallengerView = !userIsOperator && !userIsPm

  const devMatchingRoundId =
    Number(import.meta.env.VITE_DEV_MATCHING_ROUND_ID) || null

  const { data: activeMatchingRound } = useQuery({
    queryKey: ["activeMatchingRound", myChapterId],
    queryFn: (): Promise<ActiveMatchingRound | null> => {
      if (devMatchingRoundId)
        return Promise.resolve({
          id: String(devMatchingRoundId),
        } as ActiveMatchingRound)
      return getActiveMatchingRound(myChapterId!)
    },
    enabled:
      isChallengerView && (myChapterId != null || devMatchingRoundId != null),
    staleTime: 60 * 1000,
  })

  const hasOtherActiveApplication = useMemo(() => {
    if (!myApplications || !activeMatchingRound) return false
    return myApplications.some(
      (a) =>
        Number(a.matchingRound?.id) === Number(activeMatchingRound.id) &&
        Number(a.projectId) !== projectId &&
        a.status !== "CANCELLED" &&
        a.status !== "REJECTED",
    )
  }, [myApplications, activeMatchingRound, projectId])

  const ctaMode =
    viewOnly && !userIsOperator
      ? resolveProjectDetailCtaMode({
          isOperator: false,
          isPm: false,
          isSameBranch,
          isApplied,
          hasOtherActiveApplication,
          isAlreadyApproved,
        })
      : resolveProjectDetailCtaMode({
          isOperator: userIsOperator,
          isPm: userIsPm,
          isSameBranch,
          isApplied,
          hasOtherActiveApplication,
          isAlreadyApproved,
        })

  const cover: ProjectCoverImage | null = detail?.thumbnailImageUrl
    ? { src: detail.thumbnailImageUrl }
    : null
  const showLogo = logo === "on"
  const shouldShowEditCta =
    showEditCta && (resolvedEditPermissionLoading || resolvedCanEditProject)

  if (isDetailLoading) {
    return <ProjectDetailCardSkeleton />
  }

  return (
    <>
      <div className="flex w-135 flex-col items-start overflow-hidden rounded-2xl bg-white">
        <div className="bg-teal-gray-200 flex h-71.5 w-135 items-center justify-center overflow-hidden">
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

              <p className="text-body-2-regular text-teal-gray-600 w-full wrap-break-word whitespace-pre-wrap">
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
                    <div className="flex w-30.5 items-center justify-between">
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
              onClick={
                userIsOperator ? () => setIsTeamModalOpen(true) : undefined
              }
              disabled={!userIsOperator}
            />
            <Button
              variant="weak"
              color="primary"
              className="flex-1"
              disabled={!data.externalLink}
              onClick={() => {
                if (data.externalLink)
                  window.open(
                    data.externalLink,
                    "_blank",
                    "noopener,noreferrer",
                  )
              }}
            >
              기획 보기
            </Button>
            {showEditCta ? (
              shouldShowEditCta ? (
                <Button
                  className="flex-1"
                  disabled={
                    resolvedEditPermissionLoading || !resolvedCanEditProject
                  }
                  isLoading={resolvedEditPermissionLoading}
                  onClick={() => {
                    if (
                      resolvedEditPermissionLoading ||
                      !resolvedCanEditProject
                    )
                      return
                    navigate({
                      to: "/matching/projects/new",
                      search: { projectId },
                    })
                  }}
                >
                  프로젝트 수정하기
                </Button>
              ) : null
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
                {ctaMode === "my-application" && !hideMyApplication && (
                  <Button
                    className="flex-1"
                    disabled={myApplicationForProject == null}
                    onClick={() => setIsMyApplicationModalOpen(true)}
                  >
                    내 지원서 보기
                  </Button>
                )}
                {ctaMode === "apply" &&
                  (viewOnly && userIsPm
                    ? true
                    : isApplicationWritePermissionLoading ||
                      canWriteProjectApplication) && (
                    <Button
                      className="flex-1"
                      isLoading={
                        !(viewOnly && userIsPm) &&
                        (isDetailLoading || isApplicationWritePermissionLoading)
                      }
                      disabled={
                        !(viewOnly && userIsPm) &&
                        ((!isDetailLoading && !detail?.applicationFormId) ||
                          isApplicationWritePermissionLoading ||
                          !canWriteProjectApplication)
                      }
                      onClick={() => {
                        if (viewOnly && userIsPm) {
                          // PM 읽기 전용: 모집 문항 보기 모달로 열기
                          if (!detail?.applicationFormId) {
                            addToast({
                              message:
                                "지원 양식이 등록되지 않은 프로젝트입니다.",
                              color: "red",
                              variant: "deep",
                              type: "default",
                              duration: 3000,
                            })
                            return
                          }
                          setIsRecruitQuestionsModalOpen(true)
                          return
                        }
                        if (
                          isApplicationWritePermissionLoading ||
                          !canWriteProjectApplication
                        )
                          return
                        if (!detail?.applicationFormId) {
                          addToast({
                            message:
                              "지원 양식이 등록되지 않은 프로젝트입니다.",
                            color: "red",
                            variant: "deep",
                            type: "default",
                            duration: 3000,
                          })
                          return
                        }
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
                {(ctaMode === "apply-blocked-other" ||
                  ctaMode === "apply-blocked-approved") && (
                  <>
                    {!viewOnly && (
                      <Button
                        variant="weak"
                        color="primary"
                        className="flex-1"
                        isLoading={isDetailLoading}
                        disabled={
                          !isDetailLoading && !detail?.applicationFormId
                        }
                        onClick={() => setIsRecruitQuestionsModalOpen(true)}
                      >
                        모집 문항 보기
                      </Button>
                    )}
                    <Button
                      className="flex-1"
                      disabled={!viewOnly}
                      onClick={
                        viewOnly
                          ? () => {
                              if (!detail?.applicationFormId) {
                                addToast({
                                  message:
                                    "지원 양식이 등록되지 않은 프로젝트입니다.",
                                  color: "red",
                                  variant: "deep",
                                  type: "default",
                                  duration: 3000,
                                })
                                return
                              }
                              setIsRecruitQuestionsModalOpen(true)
                            }
                          : undefined
                      }
                    >
                      지원하기
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
          {!viewOnly && ctaMode === "apply-blocked-other" && (
            <p className="text-caption-2-regular text-error-600 mt-2 w-full text-center">
              이번 차수에 이미 다른 프로젝트에 지원하여 지원할 수 없습니다.
            </p>
          )}
          {!viewOnly && ctaMode === "apply-blocked-approved" && (
            <p className="text-caption-2-regular text-error-600 mt-2 w-full text-center">
              이미 합격한 챌린저는 추가로 지원할 수 없습니다.
            </p>
          )}
        </div>
      </div>

      <Modal.Root open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content aria-describedby={undefined}>
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
          <Modal.Content aria-describedby={undefined}>
            {showFormSkeleton ? (
              <ApplyFormSkeleton />
            ) : applicationForm == null ? (
              <div className="shadow-drop-neutral-3 flex h-40 w-232 items-center justify-center rounded-2xl bg-white">
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
          <Modal.Content
            aria-describedby={undefined}
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            {showFormSkeleton ? (
              <ApplyFormSkeleton />
            ) : applicationForm == null ? (
              <div className="shadow-drop-neutral-3 flex h-40 w-232 items-center justify-center rounded-2xl bg-white">
                <span className="text-body-2-regular text-teal-gray-500">
                  등록된 지원 양식이 없습니다.
                </span>
              </div>
            ) : activeMatchingRound == null ? null : (
              <ProjectApplyModal
                data={data}
                projectId={projectId}
                matchingRoundId={Number(activeMatchingRound.id)}
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

      <Modal.Root
        open={isMyApplicationModalOpen}
        onOpenChange={setIsMyApplicationModalOpen}
      >
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content aria-describedby={undefined}>
            {myApplicationForProject ? (
              <MyApplicationModal
                data={data}
                projectId={projectId}
                applicationId={Number(myApplicationForProject.applicationId)}
                isRoundOpen={
                  activeMatchingRound != null &&
                  Number(myApplicationForProject.matchingRound?.id) ===
                    Number(activeMatchingRound.id)
                }
                onClose={() => setIsMyApplicationModalOpen(false)}
                onCancelled={() => {
                  setIsMyApplicationModalOpen(false)
                  void queryClient.invalidateQueries({
                    queryKey: ["myApplications", activeGisuId],
                  })
                }}
              />
            ) : (
              <div className="shadow-drop-neutral-3 flex h-40 w-232 items-center justify-center rounded-2xl bg-white">
                <span className="text-body-2-regular text-teal-gray-500">
                  지원 내역을 찾을 수 없습니다.
                </span>
              </div>
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}
