/** 피그마 기준 Project Card Lg입니다. */
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { useResourcePermission } from "@/features/auth/hooks/useResourcePermission"
import {
  getCurrentChallengerPart,
  getLatestChallengerRecord,
  isCurrentTermPm,
  isOperator,
} from "@/features/auth/model/identity"
import { useProjectPermissions } from "@/features/project/hooks/useProjectPermissions"
import {
  getApplicationForm,
  mapApplicationFormToSections,
  projectKeys,
} from "@/features/project/new/api"
import { UsabilitySurvey } from "@/features/usability-survey"
import { trackEvent } from "@/shared/analytics"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { ProjectLogo } from "@/shared/assets/icon/logo/ProjectLogo"
import { useActiveGisu } from "@/shared/hooks/useActiveGisu"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"
import { withImageCacheKey } from "@/shared/lib/withImageCacheKey"
import { Button } from "@/shared/ui/Button"
import { TeamMemberButton } from "@/shared/ui/button/TeamMemberButton"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import MemberCount from "@/shared/ui/MemberCount"
import { Modal } from "@/shared/ui/Modal"
import { ProjectThumbnail } from "@/shared/ui/ProjectThumbnail"
import { useViewerIdentity } from "@/shared/view-mode/useViewerIdentity"

import {
  getActiveMatchingRound,
  getMyApplications,
  getProjectDetail,
} from "../api/matchingProject"
import { filterApplicationSectionsByPart } from "../model/applicationSectionFilter"
import { isRecruitDone } from "../model/matchingProject"
import { DEFAULT_MATCHING_PROJECT_MOCK } from "../model/matchingProject.mock"
import {
  isApplyButtonDisabled,
  resolveProjectDetailCtaMode,
  selectCurrentApplicationForProject,
  selectIsAlreadyApproved,
  selectIsPartIneligible,
  selectIsPartRecruitClosed,
} from "../model/projectDetailCta"
import { ApplyFormSkeleton } from "./apply-modal/ApplyFormSkeleton"
import { MyApplicationModal } from "./apply-modal/MyApplicationModal"
import {
  ProjectApplyModal,
  type ProjectApplyModalHandle,
} from "./apply-modal/ProjectApplyModal"
import { RecruitQuestionsViewModal } from "./apply-modal/RecruitQuestionsViewModal"
import { TeamMemberModal } from "./team-member-modal/TeamMemberModal"

import type { ActiveMatchingRound, ProjectDetail } from "../api/matchingProject"
import type { MatchingProject } from "../model/matchingProject"

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
  /** 매칭 기간 중 수정하기 버튼 숨김 */
  isMatchingPeriod?: boolean
}

function ProjectDetailCardSkeleton() {
  return (
    <div className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-135 min-w-0 flex-col items-start overflow-x-hidden overflow-y-auto rounded-2xl bg-white">
      <div className="bg-teal-gray-200 aspect-[540/286] w-full shrink-0 animate-pulse" />
      <div className="bp1:p-5 flex w-full flex-col items-start p-4">
        <div className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full flex-col items-start gap-2.5">
            <div className="bp1:flex-row bp1:items-center bp1:justify-between bp1:gap-4 flex w-full flex-col items-start gap-2.5">
              <div className="bg-teal-gray-150 h-6 w-full max-w-52 animate-pulse rounded-md" />
              <div className="bg-teal-gray-150 h-4 w-32 animate-pulse rounded-md" />
            </div>
            <div className="bg-teal-gray-150 h-4 w-full animate-pulse rounded-md" />
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
        <div className="bp1:mt-8.5 bp1:flex-row bp1:items-start mt-6 flex w-full flex-col items-stretch gap-2.5">
          <div className="bg-teal-gray-150 bp1:w-11 h-11 w-full animate-pulse rounded-xl" />
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
const PART_ORDER = ["DESIGN", "WEB", "IOS", "ANDROID", "SPRINGBOOT", "NODEJS"]

function toMatchingProject(
  detail: ProjectDetail,
  imageCacheKey: number,
): MatchingProject {
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
    logoImage: detail.logoImageUrl
      ? {
          src:
            withImageCacheKey(detail.logoImageUrl, imageCacheKey) ??
            detail.logoImageUrl,
          alt: `${detail.name} 로고`,
        }
      : null,
    coverImage: detail.thumbnailImageUrl
      ? {
          src:
            withImageCacheKey(detail.thumbnailImageUrl, imageCacheKey) ??
            detail.thumbnailImageUrl,
          alt: `${detail.name} 대표 이미지`,
        }
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
  isMatchingPeriod = false,
}: ProjectDetailCardProps) {
  const projectId = Number(projectIdProp)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { me, viewContext } = useViewerIdentity()
  const addToast = useToastStore((s) => s.addToast)
  const userIsOperator = isOperator(me)
  const userIsPm = isCurrentTermPm(me)
  const isAdminView = viewContext.isAdminView && userIsOperator
  const isPmView = viewContext.isPmView
  const isApplicantView =
    viewContext.isChallengerView || (!userIsOperator && !userIsPm)
  const shouldQueryEditPermission =
    showEditCta && canEditProject === undefined && Number.isFinite(projectId)
  const projectPermissionsQuery = useProjectPermissions(projectId, {
    enabled: shouldQueryEditPermission,
  })
  const shouldQueryApplicationWritePermission =
    !showEditCta &&
    Number.isFinite(projectId) &&
    me !== undefined &&
    isApplicantView
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
  const applyModalRef = useRef<ProjectApplyModalHandle>(null)
  const [isMyApplicationModalOpen, setIsMyApplicationModalOpen] =
    useState(false)
  const [isRecruitQuestionsModalOpen, setIsRecruitQuestionsModalOpen] =
    useState(false)
  const [isSurveyActive, setIsSurveyActive] = useState(false)
  const {
    data: detail,
    dataUpdatedAt: detailDataUpdatedAt,
    isLoading: isDetailLoading,
  } = useQuery({
    queryKey: ["projectDetail", projectId],
    queryFn: () => getProjectDetail(projectId),
    staleTime: 5 * 60 * 1000,
  })

  const { data: activeGisuData } = useActiveGisu()
  const activeGisuId = activeGisuData?.gisuId ?? null

  const { data: myApplications, isError: isMyApplicationsError } = useQuery({
    queryKey: ["myApplications", activeGisuId],
    queryFn: () => getMyApplications(activeGisuId!),
    enabled: activeGisuId != null && isApplicantView && me != null,
  })

  const myChapterId = useMemo(() => {
    const id =
      viewContext.currentChapterId ?? getLatestChallengerRecord(me)?.chapterId
    return id != null ? Number(id) : null
  }, [me, viewContext.currentChapterId])

  const isAlreadyApproved = selectIsAlreadyApproved(myApplications)

  const data = detail
    ? toMatchingProject(detail, detailDataUpdatedAt)
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
    staleTime: 0,
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

  const myMatchingPart = useMemo(() => {
    return getCurrentChallengerPart(me)
  }, [me])

  const visibleSections = useMemo(() => {
    if (!isApplicantView) return sections
    return filterApplicationSectionsByPart(sections, myMatchingPart)
  }, [sections, isApplicantView, myMatchingPart])

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

  const isSameBranch = isAdminView
    ? true
    : projectChapterId != null && myChapterId != null
      ? projectChapterId === myChapterId
      : true

  const devMatchingRoundId =
    Number(import.meta.env.VITE_DEV_MATCHING_ROUND_ID) || null

  const { data: activeMatchingRound, isLoading: isActiveMatchingRoundLoading } =
    useQuery({
      queryKey: ["activeMatchingRound", myChapterId],
      queryFn: (): Promise<ActiveMatchingRound | null> => {
        if (devMatchingRoundId)
          return Promise.resolve({
            id: String(devMatchingRoundId),
          } as ActiveMatchingRound)
        return getActiveMatchingRound(myChapterId!)
      },
      enabled:
        isApplicantView && (myChapterId != null || devMatchingRoundId != null),
      staleTime: 60 * 1000,
    })

  const myApplicationForProject = selectCurrentApplicationForProject({
    applications: myApplications,
    projectId,
    activeMatchingRoundId: isActiveMatchingRoundLoading
      ? undefined
      : (activeMatchingRound?.id ?? null),
  })
  const isApplied = myApplicationForProject != null
  const isDraftApplication = myApplicationForProject?.status === "DRAFT"

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

  const isApplicationStatusResolving =
    isApplicantView &&
    (myApplications === undefined || activeMatchingRound === undefined) &&
    !isMyApplicationsError

  const isPartIneligible =
    isApplicantView &&
    detail != null &&
    selectIsPartIneligible(detail.partQuotas, myMatchingPart)

  const isPartRecruitClosed =
    isApplicantView &&
    detail != null &&
    selectIsPartRecruitClosed(detail.partQuotas, myMatchingPart)

  const hasActiveRoundForCtaMode: boolean | undefined =
    isApplicantView && !isActiveMatchingRoundLoading
      ? activeMatchingRound != null
      : undefined

  const ctaMode =
    viewOnly && !isAdminView && !isPmView
      ? resolveProjectDetailCtaMode({
          isOperator: false,
          isPm: false,
          isSameBranch,
          isApplied,
          isDraftApplication,
          hasOtherActiveApplication,
          isAlreadyApproved,
          isPartIneligible,
          isPartRecruitClosed,
        })
      : resolveProjectDetailCtaMode({
          isOperator: isAdminView,
          isPm: isPmView,
          isSameBranch,
          isApplied,
          isDraftApplication,
          hasOtherActiveApplication,
          isAlreadyApproved,
          isPartIneligible,
          isPartRecruitClosed,
          hasActiveRound: hasActiveRoundForCtaMode,
        })

  const cover = data.coverImage
  const showLogo = logo === "on"
  const shouldShowEditCta =
    showEditCta && (resolvedEditPermissionLoading || resolvedCanEditProject)

  useEffect(() => {
    if (!detail) return
    trackEvent("project_detail_view", {
      project_id: projectId,
      cta_mode: ctaMode,
      view_only: viewOnly,
      has_external_link: Boolean(detail.externalLink),
      has_application_form: Boolean(detail.applicationFormId),
    })
  }, [detail, projectId, ctaMode, viewOnly])

  if (isDetailLoading) {
    return <ProjectDetailCardSkeleton />
  }

  return (
    <>
      <div className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-135 min-w-0 flex-col items-start overflow-x-hidden overflow-y-auto rounded-2xl bg-white">
        <div className="bg-teal-gray-200 flex aspect-[540/286] w-full shrink-0 items-center justify-center overflow-hidden">
          <ProjectThumbnail
            src={cover?.src}
            alt={cover?.alt ?? `${data.title} 대표 이미지`}
          />
        </div>

        <div className="bp1:p-5 flex w-full flex-col items-start p-4">
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full flex-col items-start gap-2.5">
              <div className="bp1:flex-row bp1:items-center bp1:justify-between bp1:gap-4 flex w-full min-w-0 flex-col items-start gap-2.5">
                {showLogo ? (
                  <div className="bp1:w-auto flex w-full min-w-0 items-center gap-2">
                    <ProjectLogo src={data.logoImage?.src} />
                    <h2 className="text-heading-6-semibold text-teal-gray-900 bp1:line-clamp-1 bp1:w-60 line-clamp-2 w-full min-w-0">
                      {data.title}
                    </h2>
                  </div>
                ) : (
                  <h2 className="text-heading-6-semibold text-teal-gray-900 bp1:line-clamp-1 bp1:w-60 line-clamp-2 w-full min-w-0">
                    {data.title}
                  </h2>
                )}

                <p className="text-body-2-regular text-teal-gray-500 bp1:w-auto bp1:shrink-0 bp1:text-right line-clamp-1 w-full text-left">
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
                    className="flex w-full min-w-0 items-center justify-between gap-3"
                  >
                    <div className="flex w-30.5 min-w-0 shrink-0 items-center justify-between gap-2">
                      <span className="text-body-2-medium text-teal-gray-700 truncate">
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

          <div className="bp1:mt-8.5 scrollbar-none mt-6 flex w-full flex-nowrap items-start gap-2.5 overflow-x-auto pb-1">
            <TeamMemberButton
              variant="weak"
              className="w-auto"
              onClick={() => setIsTeamModalOpen(true)}
            />
            <Button
              variant="weak"
              color="primary"
              className="min-w-28 flex-1 whitespace-nowrap"
              disabled={
                ctaMode !== "apply-blocked-approved" && !data.externalLink
              }
              onClick={() => {
                trackEvent("project_plan_click", {
                  project_id: projectId,
                  cta_mode: ctaMode,
                  has_external_link: Boolean(data.externalLink),
                })
                if (!data.externalLink) {
                  if (ctaMode === "apply-blocked-approved") {
                    addToast({
                      message: "업로드된 기획안이 없습니다.",
                      color: "primary",
                      variant: "deep",
                      type: "default",
                      duration: 3000,
                    })
                  }
                  return
                }
                window.open(data.externalLink, "_blank", "noopener,noreferrer")
              }}
            >
              기획 보기
            </Button>
            {showEditCta && !isMatchingPeriod ? (
              shouldShowEditCta ? (
                <Button
                  className="min-w-36 flex-1 whitespace-nowrap"
                  disabled={
                    resolvedEditPermissionLoading || !resolvedCanEditProject
                  }
                  isLoading={resolvedEditPermissionLoading}
                  onClick={() => {
                    trackEvent("project_edit_click", {
                      project_id: projectId,
                    })
                    if (
                      resolvedEditPermissionLoading ||
                      !resolvedCanEditProject
                    )
                      return
                    navigate({
                      to: "/matching/projects/edit/$projectId",
                      params: { projectId: Number(projectId) },
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
                    className="min-w-32 flex-1 whitespace-nowrap"
                    isLoading={isDetailLoading}
                    disabled={!isDetailLoading && !detail?.applicationFormId}
                    onClick={() => {
                      trackEvent("project_questions_click", {
                        project_id: projectId,
                        cta_mode: ctaMode,
                      })
                      setIsRecruitQuestionsModalOpen(true)
                    }}
                  >
                    모집 문항 보기
                  </Button>
                )}
                {ctaMode === "my-application" && !hideMyApplication && (
                  <Button
                    className="min-w-32 flex-1 whitespace-nowrap"
                    disabled={myApplicationForProject == null}
                    onClick={() => {
                      trackEvent("my_application_click", {
                        project_id: projectId,
                      })
                      setIsMyApplicationModalOpen(true)
                    }}
                  >
                    내 지원서 보기
                  </Button>
                )}
                {ctaMode === "apply" &&
                  (isApplicationWritePermissionLoading ||
                    canWriteProjectApplication) && (
                    <Button
                      className="min-w-28 flex-1 whitespace-nowrap"
                      isLoading={
                        isDetailLoading || isApplicationWritePermissionLoading
                      }
                      disabled={isApplyButtonDisabled({
                        isPmReadonly: false,
                        isDetailLoading,
                        hasApplicationForm: !!detail?.applicationFormId,
                        isWritePermissionLoading:
                          isApplicationWritePermissionLoading,
                        canWriteApplication: canWriteProjectApplication,
                        hasActiveRound: activeMatchingRound != null,
                        isApplicationStatusResolving,
                      })}
                      onClick={() => {
                        trackEvent("project_apply_click", {
                          project_id: projectId,
                          cta_mode: ctaMode,
                          is_draft_application: isDraftApplication,
                        })
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
                      {isDraftApplication ? "이어서 작성하기" : "지원하기"}
                    </Button>
                  )}
                {ctaMode === "apply-blocked-approved" && (
                  <Button
                    variant="weak"
                    color="primary"
                    className="min-w-32 flex-1 whitespace-nowrap"
                    disabled={!detail?.applicationFormId}
                    onClick={() => {
                      trackEvent("project_questions_click", {
                        project_id: projectId,
                        cta_mode: ctaMode,
                      })
                      setIsRecruitQuestionsModalOpen(true)
                    }}
                  >
                    모집 문항 보기
                  </Button>
                )}
                {(ctaMode === "apply-blocked-other" ||
                  ctaMode === "apply-blocked-part" ||
                  ctaMode === "apply-blocked-closed") && (
                  <Button
                    variant="weak"
                    color="primary"
                    className="min-w-32 flex-1 whitespace-nowrap"
                    disabled={!detail?.applicationFormId}
                    onClick={() => {
                      trackEvent("project_questions_click", {
                        project_id: projectId,
                        cta_mode: ctaMode,
                      })
                      setIsRecruitQuestionsModalOpen(true)
                    }}
                  >
                    모집 문항 보기
                  </Button>
                )}
                {ctaMode === "no-active-round" && (
                  <Button
                    variant="weak"
                    color="primary"
                    className="min-w-32 flex-1 whitespace-nowrap"
                    isLoading={isDetailLoading}
                    disabled={!isDetailLoading && !detail?.applicationFormId}
                    onClick={() => {
                      trackEvent("project_questions_click", {
                        project_id: projectId,
                        cta_mode: ctaMode,
                      })
                      setIsRecruitQuestionsModalOpen(true)
                    }}
                  >
                    모집 문항 보기
                  </Button>
                )}
                {ctaMode === "other-branch" && (
                  <Button
                    variant="weak"
                    color="primary"
                    className="min-w-32 flex-1 whitespace-nowrap"
                    disabled={!detail?.applicationFormId}
                    onClick={() => {
                      trackEvent("project_questions_click", {
                        project_id: projectId,
                        cta_mode: ctaMode,
                      })
                      setIsRecruitQuestionsModalOpen(true)
                    }}
                  >
                    모집 문항 보기
                  </Button>
                )}
              </>
            )}
          </div>
          {!viewOnly && ctaMode === "apply-blocked-other" && (
            <div className="mt-2 flex w-full items-center justify-center gap-1">
              <CheckIcon className="text-teal-gray-500 h-4 w-4 shrink-0" />
              <p className="text-caption-2-regular text-teal-gray-500 text-center">
                이번 차수에 이미 다른 프로젝트에 지원하여 지원할 수 없습니다.
              </p>
            </div>
          )}
          {!viewOnly && ctaMode === "apply-blocked-approved" && (
            <div className="mt-2 flex w-full items-center justify-center gap-1">
              <CheckIcon className="text-teal-gray-500 h-4 w-4 shrink-0" />
              <p className="text-caption-2-regular text-teal-gray-500 text-center">
                이미 합격한 챌린저는 추가로 지원할 수 없습니다.
              </p>
            </div>
          )}
          {!viewOnly && ctaMode === "apply-blocked-part" && (
            <div className="mt-2 flex w-full items-center justify-center gap-1">
              <CheckIcon className="text-teal-gray-500 h-4 w-4 shrink-0" />
              <p className="text-caption-2-regular text-teal-gray-500 text-center">
                지원 가능한 파트가 아니어서 지원할 수 없습니다.
              </p>
            </div>
          )}
          {!viewOnly && ctaMode === "apply-blocked-closed" && (
            <div className="mt-2 flex w-full items-center justify-center gap-1">
              <CheckIcon className="text-teal-gray-500 h-4 w-4 shrink-0" />
              <p className="text-caption-2-regular text-teal-gray-500 text-center">
                해당 파트는 모집이 마감되었습니다.
              </p>
            </div>
          )}
          {!viewOnly && ctaMode === "no-active-round" && (
            <div className="mt-2 flex w-full items-center justify-center gap-1">
              <CheckIcon className="text-teal-gray-500 h-4 w-4 shrink-0" />
              <p className="text-caption-2-regular text-teal-gray-500 text-center">
                현재 지원할 수 있는 매칭 기간이 아닙니다.
              </p>
            </div>
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
              <div className="shadow-drop-neutral-3 flex h-40 w-[calc(100vw-2rem)] max-w-232 items-center justify-center rounded-2xl bg-white">
                <span className="text-body-2-regular text-teal-gray-500">
                  등록된 모집 문항이 없습니다.
                </span>
              </div>
            ) : (
              <RecruitQuestionsViewModal
                data={data}
                sections={visibleSections}
              />
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <Modal.Root open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content
            aria-describedby={undefined}
            onInteractOutside={(e) => {
              e.preventDefault()
              if (applyModalRef.current) applyModalRef.current.requestClose()
              else setIsApplyModalOpen(false)
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault()
              if (applyModalRef.current) applyModalRef.current.requestClose()
              else setIsApplyModalOpen(false)
            }}
          >
            {showFormSkeleton ? (
              <ApplyFormSkeleton />
            ) : applicationForm == null ? (
              <div className="shadow-drop-neutral-3 flex h-40 w-[calc(100vw-2rem)] max-w-232 items-center justify-center rounded-2xl bg-white">
                <span className="text-body-2-regular text-teal-gray-500">
                  등록된 지원 양식이 없습니다.
                </span>
              </div>
            ) : activeMatchingRound == null ? null : (
              <ProjectApplyModal
                ref={applyModalRef}
                data={data}
                projectId={projectId}
                matchingRoundId={Number(activeMatchingRound.id)}
                sections={visibleSections}
                canToggleSection={!isApplicantView}
                initialApplicationId={
                  isDraftApplication && myApplicationForProject
                    ? Number(myApplicationForProject.applicationId)
                    : undefined
                }
                onBack={() => setIsApplyModalOpen(false)}
                onDraftSaved={() => {
                  void queryClient.invalidateQueries({
                    queryKey: ["myApplications", activeGisuId],
                  })
                }}
                onSubmitSuccess={() => {
                  setIsApplyModalOpen(false)
                  void queryClient.invalidateQueries({
                    queryKey: ["myApplications", activeGisuId],
                  })
                  setIsSurveyActive(true)
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
              <div className="shadow-drop-neutral-3 flex h-40 w-[calc(100vw-2rem)] max-w-232 items-center justify-center rounded-2xl bg-white">
                <span className="text-body-2-regular text-teal-gray-500">
                  지원 내역을 찾을 수 없습니다.
                </span>
              </div>
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <UsabilitySurvey
        context="APPLICATION_SUBMITTED"
        active={isSurveyActive}
      />
    </>
  )
}
