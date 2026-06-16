import { zodResolver } from "@hookform/resolvers/zod"
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { isAxiosError } from "axios"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  getProjectPmSearchScope,
  isCentralStaff,
  isCurrentTermPm,
  isSuperAdmin,
} from "@/features/auth/model/identity"
import { searchChallengersByCursor } from "@/features/challenger/api/member"
import { Dropdown } from "@/features/challenger/ui/shared/Dropdown"
import {
  addProjectMember,
  createProjectDraft,
  invalidateProjectSummaryQueries,
  removeProjectMember,
  updateProjectDraft,
  uploadFileFlow,
} from "@/features/project/new/api"
import { challengerSearchItemToMemberItem } from "@/features/project/new/api/memberAdapter"
import { getActiveGisu } from "@/shared/api/gisu"
import InfoCircleIcon from "@/shared/assets/icon/infomation/InfoCircleIcon"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"
import { Button } from "@/shared/ui/Button"
import { ImageUploader } from "@/shared/ui/ImageUploader"
import { InputBox } from "@/shared/ui/input/InputBox"
import { useViewerIdentity } from "@/shared/view-mode/useViewerIdentity"

import {
  type BasicInfoFormData,
  basicInfoSchema,
} from "../../model/basicInfoSchema"
import { useProjectRegisterStore } from "../../model/useProjectRegisterStore"
import { SectionHeader } from "../shared/SectionHeader"
import { ProjectCardForm } from "./ProjectCardForm"

import type { MemberItem } from "@/shared/ui/searchbar/MemberSearchBar"

function extractApiErrorCode(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined
  const data = error.response?.data
  if (typeof data !== "object" || data === null) return undefined
  const code = (data as { code?: unknown }).code
  return typeof code === "string" ? code : undefined
}

function isMemberItem(
  member: MemberItem | null | undefined,
): member is MemberItem {
  return member != null
}

function mergeMemberItems(
  ...groups: ReadonlyArray<ReadonlyArray<MemberItem | null | undefined>>
): MemberItem[] {
  const members = new Map<string, MemberItem>()
  groups
    .flat()
    .filter(isMemberItem)
    .forEach((member) => {
      members.set(member.id, member)
    })
  return Array.from(members.values())
}

export interface BasicInfoFormHandle {
  validate: () => Promise<boolean>
  save: () => Promise<boolean>
  getIsDirty: () => boolean
}

interface BasicInfoFormProps {
  canCreateProject?: boolean
  createPermissionLoading?: boolean
  onNext: () => void
}

export const BasicInfoForm = forwardRef<
  BasicInfoFormHandle,
  BasicInfoFormProps
>(function BasicInfoForm(
  { canCreateProject = true, createPermissionLoading = false, onNext },
  ref,
) {
  const { me: meData } = useViewerIdentity()
  const isPm = isCurrentTermPm(meData)
  const activeGisuQuery = useQuery({
    queryKey: ["gisu"],
    queryFn: getActiveGisu,
    staleTime: 5 * 60 * 1000,
  })
  const activeGisuId = activeGisuQuery.data?.gisuId

  const pmSearchScope = useMemo(() => getProjectPmSearchScope(meData), [meData])

  const pmListQuery = useInfiniteQuery({
    queryKey: [
      "member",
      "cursor",
      { part: "PLAN", gisuId: activeGisuId, ...pmSearchScope },
    ],
    queryFn: ({ pageParam }) =>
      searchChallengersByCursor({
        cursor: pageParam,
        part: "PLAN",
        gisuId: activeGisuId != null ? String(activeGisuId) : undefined,
        size: 50,
        ...pmSearchScope,
      }),
    enabled: activeGisuId != null,
    getNextPageParam: (lastPage) =>
      lastPage.cursor.hasNext ? lastPage.cursor.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 60 * 1000,
  })

  const storePmInfo = useProjectRegisterStore((s) => s.pmInfo)
  const setPmInfo = useProjectRegisterStore((s) => s.setPmInfo)
  const uploaded = useProjectRegisterStore((s) => s.uploaded)
  const setUploaded = useProjectRegisterStore((s) => s.setUploaded)
  const projectId = useProjectRegisterStore((s) => s.projectId)
  const gisuId = useProjectRegisterStore((s) => s.gisuId)
  const setProjectId = useProjectRegisterStore((s) => s.setProjectId)
  const setBasicInfo = useProjectRegisterStore((s) => s.setBasicInfo)
  const basicDraftFields = useProjectRegisterStore((s) => s.basicDraftFields)
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const [isSaving, setIsSaving] = useState(false)
  const [hasSavedOnce, setHasSavedOnce] = useState(false)
  const [savedSnapshot, setSavedSnapshot] = useState<{
    pm1: MemberItem | null
    pm2: MemberItem | null
    isMultiPm: boolean
  } | null>(null)

  const [isMultiPm, setIsMultiPm] = useState(storePmInfo.isMultiPm)
  const [pm1Member, setPm1Member] = useState<MemberItem | null>(storePmInfo.pm1)
  const [pm1Error, setPm1Error] = useState(false)
  const [pm2Member, setPm2Member] = useState<MemberItem | null>(storePmInfo.pm2)
  const [pm2Error, setPm2Error] = useState(false)

  const isCentral = isCentralStaff(meData) || isSuperAdmin(meData)

  const selfPmMember = useMemo<MemberItem | null>(() => {
    if (!isPm || !meData) return null
    return {
      id: meData.id,
      nickname: meData.nickname,
      name: meData.name,
      university: formatSchoolName(meData.schoolName),
    }
  }, [isPm, meData])

  const loadedPmMembers = useMemo(
    () =>
      (pmListQuery.data?.pages ?? [])
        .flatMap((page) => page.cursor.content)
        .map(challengerSearchItemToMemberItem)
        .filter(isMemberItem),
    [pmListQuery.data],
  )

  const allPmMembers = useMemo(() => {
    const members = mergeMemberItems(loadedPmMembers, [
      pm1Member,
      pm2Member,
      storePmInfo.pm1,
      storePmInfo.pm2,
      selfPmMember,
    ])
    if (isCentral) {
      return [...members].sort((a, b) =>
        a.nickname.localeCompare(b.nickname, "ko"),
      )
    }
    return members
  }, [
    isCentral,
    loadedPmMembers,
    pm1Member,
    pm2Member,
    selfPmMember,
    storePmInfo.pm1,
    storePmInfo.pm2,
  ])

  const pm1Options = useMemo(
    () =>
      allPmMembers.map((m) => ({
        value: m.id,
        label: `${m.nickname}/${m.name} · ${m.university}`,
      })),
    [allPmMembers],
  )

  const pm2Options = useMemo(() => {
    const excludeId = pm1Member?.id
    return allPmMembers
      .filter((m) => m.id !== excludeId)
      .map((m) => ({
        value: m.id,
        label: `${m.nickname}/${m.name} · ${m.university}`,
      }))
  }, [allPmMembers, pm1Member])

  const thumbnailRef = useRef<HTMLButtonElement>(null)
  const logoRef = useRef<HTMLButtonElement>(null)
  const externalLinkRef = useRef<HTMLInputElement>(null)

  const normalizeExternalLink = (
    url: string | undefined,
  ): string | undefined => {
    if (!url?.trim()) return undefined
    const trimmed = url.trim()
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  }

  const {
    register,
    setValue,
    setFocus,
    getValues,
    reset,
    watch,
    trigger,
    formState: { errors, dirtyFields },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    shouldFocusError: false,
  })

  const runReadingOrderValidation = async (): Promise<boolean> => {
    const titleOk = await trigger("title")
    if (!titleOk) {
      addToast({
        message: "프로젝트 이름을 입력해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      setTimeout(() => setFocus("title"), 0)
      return false
    }
    const descOk = await trigger("description")
    if (!descOk) {
      addToast({
        message: "프로젝트 한 줄 소개를 입력해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      setTimeout(() => setFocus("description"), 0)
      return false
    }
    const imagesValid = await trigger(["thumbnail", "logo"])
    if (!imagesValid) {
      addToast({
        message: "이미지 형식 또는 크기(10MB 이하)를 확인해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    }
    if (!pm1Member) {
      setPm1Error(true)
      addToast({
        message: "PM을 선택해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    }
    if (isMultiPm && !pm2Member) {
      setPm2Error(true)
      addToast({
        message: "모든 PM을 선택해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    }
    const linkOk = await trigger("externalLink")
    if (!linkOk) {
      addToast({
        message: "올바른 URL을 입력해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      setTimeout(() => externalLinkRef.current?.focus(), 0)
      return false
    }
    return true
  }

  useImperativeHandle(ref, () => ({
    validate: () => runReadingOrderValidation(),
    save: () => handleTempSave({ silent: false }),
    getIsDirty: () => hasUnsavedChanges,
  }))

  useEffect(() => {
    if (!basicDraftFields) return
    const { title, description, externalLink } = basicDraftFields
    setValue("title", title, { shouldDirty: false })
    setValue("description", description, { shouldDirty: false })
    setValue("externalLink", externalLink, { shouldDirty: false })
  }, [basicDraftFields, setValue])

  useEffect(() => {
    setPm1Member(storePmInfo.pm1)
    setPm2Member(storePmInfo.pm2)
    setIsMultiPm(storePmInfo.isMultiPm)
    setSavedSnapshot({
      pm1: storePmInfo.pm1,
      pm2: storePmInfo.pm2,
      isMultiPm: storePmInfo.isMultiPm,
    })
  }, [storePmInfo])

  useEffect(() => {
    if (!isPm || !meData || pm1Member !== null) return
    const self = allPmMembers.find((m) => m.id === meData.id)
    if (self) {
      setPm1Member(self)
      setPm1Error(false)
    }
  }, [isPm, meData, allPmMembers, pm1Member])

  const isPmChanged = savedSnapshot
    ? pm1Member !== savedSnapshot.pm1 ||
      pm2Member !== savedSnapshot.pm2 ||
      isMultiPm !== savedSnapshot.isMultiPm
    : pm1Member !== null || pm2Member !== null || isMultiPm

  const hasDirtyFields = Object.keys(dirtyFields).length > 0
  const hasUnsavedChanges = hasDirtyFields || isPmChanged
  const canCreateDraft =
    projectId !== null || (canCreateProject && !createPermissionLoading)
  const canTempSave = hasUnsavedChanges && !isSaving && canCreateDraft
  const tempSaveLabel =
    hasSavedOnce && !hasUnsavedChanges ? "저장 완료" : "임시 저장"

  const handleTempSave = async (options?: {
    silent?: boolean
  }): Promise<boolean> => {
    const silent = options?.silent ?? false
    if (!hasUnsavedChanges) return true
    if (!canCreateDraft) {
      addToast({
        message: "임시 저장에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    }
    const values = getValues()
    if (!projectId && !pm1Member) {
      addToast({
        message: "PM을 선택한 뒤 임시 저장해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    }
    setIsSaving(true)
    try {
      let resolvedProjectId = projectId
      if (!resolvedProjectId) {
        if (!gisuId) throw new Error("기수 정보를 불러오는 중입니다.")
        const created = await createProjectDraft({
          gisuId,
          productOwnerMemberId: Number(pm1Member!.id),
        })
        const newId = created.projectId
        if (!newId) throw new Error("프로젝트 생성 실패")
        setProjectId(newId)
        resolvedProjectId = newId
      }

      let thumbnailFileId = uploaded.thumbnailFileId
      if (values.thumbnail instanceof File && !thumbnailFileId) {
        const res = await uploadFileFlow(values.thumbnail, "PROJECT_THUMBNAIL")
        thumbnailFileId = res.fileId ?? null
        setUploaded({ thumbnailFileId })
      }

      let logoFileId = uploaded.logoFileId
      if (values.logo instanceof File && !logoFileId) {
        const res = await uploadFileFlow(values.logo, "PROJECT_LOGO")
        logoFileId = res.fileId ?? null
        setUploaded({ logoFileId })
      }

      await updateProjectDraft(resolvedProjectId, {
        name: values.title,
        description: values.description,
        thumbnailFileId: thumbnailFileId ?? undefined,
        logoFileId: logoFileId ?? undefined,
        externalLink: normalizeExternalLink(values.externalLink),
      })

      const prevPm2Id = savedSnapshot?.pm2?.id
      const currPm2Id = pm2Member?.id
      if (prevPm2Id && prevPm2Id !== currPm2Id) {
        await removeProjectMember(resolvedProjectId, Number(prevPm2Id))
      }
      if (currPm2Id && currPm2Id !== prevPm2Id) {
        await addProjectMember(resolvedProjectId, {
          memberId: Number(currPm2Id),
          part: "PLAN",
        })
      }

      setPmInfo({ isMultiPm, pm1: pm1Member, pm2: pm2Member })
      invalidateProjectSummaryQueries(queryClient, resolvedProjectId)
      reset(values, { keepValues: true, keepDirty: false })
      setSavedSnapshot({ pm1: pm1Member, pm2: pm2Member, isMultiPm })
      setHasSavedOnce(true)
      if (!silent) {
        addToast({
          message: "작성한 내용이 임시 저장되었습니다.",
          color: "primary",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      }
      return true
    } catch (error) {
      const code = extractApiErrorCode(error)
      addToast({
        message:
          code === "PROJECT-0012"
            ? "선택한 PM의 프로젝트를 생성할 권한이 없습니다. 담당 범위 내 PM을 선택해 주세요."
            : "임시 저장에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const ok = await runReadingOrderValidation()
    if (!ok) return
    const values = getValues()
    if (hasUnsavedChanges) {
      const saved = await handleTempSave({ silent: true })
      if (!saved) return
      addToast({
        message: "작성한 내용이 저장되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
    setBasicInfo(values)
    onNext()
  }

  const displayNickname = pm1Member?.nickname ?? meData?.nickname ?? "-"
  const displayName = pm1Member?.name ?? meData?.name ?? "-"
  const displayUniversity =
    formatSchoolName(pm1Member?.university ?? meData?.schoolName) || "-"

  const pmDropdownDisabled = activeGisuId == null || pmListQuery.isLoading
  const handlePmDropdownReachEnd = () => {
    if (!pmListQuery.hasNextPage || pmListQuery.isFetchingNextPage) return
    void pmListQuery.fetchNextPage()
  }

  return (
    <form
      noValidate
      onSubmit={handleFormSubmit}
      className="bp1:px-4 bp2:gap-14 flex flex-col justify-start gap-10 px-0 pt-4"
    >
      <div className="flex flex-col gap-4">
        <SectionHeader index={1} title="프로젝트 카드" />
        <div className="flex min-w-0 flex-col items-start gap-6 xl:flex-row xl:items-start">
          <ProjectCardForm
            nickname={displayNickname}
            name={displayName}
            university={displayUniversity}
            register={register}
            setValue={(name, value, options) =>
              setValue(name, value, { shouldDirty: true, ...options })
            }
            watch={watch}
            errors={errors}
            thumbnailRef={thumbnailRef}
            thumbnailUrl={uploaded.thumbnailUrl ?? undefined}
            logoUrl={uploaded.logoUrl ?? undefined}
          />
          <div className="flex w-4/5 max-w-full min-w-0 flex-col gap-2 xl:w-78 xl:shrink-0">
            <Dropdown<string>
              id="pm1-select"
              value={pm1Member?.id}
              onChange={(memberId) => {
                const found =
                  allPmMembers.find((m) => m.id === memberId) ?? null
                setPm1Member(found)
                setPm1Error(false)
              }}
              options={pm1Options}
              placeholder={
                isMultiPm
                  ? "메인 PM 닉네임/이름을 선택하세요."
                  : "PM 닉네임/이름을 선택하세요."
              }
              error={pm1Error}
              disabled={pmDropdownDisabled}
              hasMore={pmListQuery.hasNextPage}
              isLoadingMore={pmListQuery.isFetchingNextPage}
              onReachEnd={handlePmDropdownReachEnd}
            />
            {isMultiPm && (
              <Dropdown<string>
                id="pm2-select"
                value={pm2Member?.id}
                onChange={(memberId) => {
                  const found =
                    allPmMembers.find((m) => m.id === memberId) ?? null
                  setPm2Member(found)
                  setPm2Error(false)
                }}
                options={pm2Options}
                placeholder="PM 닉네임/이름을 선택하세요."
                error={pm2Error}
                disabled={pmDropdownDisabled}
                hasMore={pmListQuery.hasNextPage}
                isLoadingMore={pmListQuery.isFetchingNextPage}
                onReachEnd={handlePmDropdownReachEnd}
              />
            )}
            <button
              type="button"
              onClick={() => {
                if (isMultiPm) {
                  setPm2Member(null)
                  setPm2Error(false)
                }
                setIsMultiPm((prev) => !prev)
              }}
              className="text-body-2-medium text-teal-gray-400 flex items-center gap-1 self-start pl-0.5 font-medium underline decoration-solid underline-offset-auto"
            >
              <InfoCircleIcon width={14} height={14} aria-hidden="true" />
              <span>
                {isMultiPm ? "PM이 한 명인가요?" : "PM이 두 명 이상인가요?"}
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <SectionHeader index={2} title="프로젝트 로고" />
        <ImageUploader
          ref={logoRef}
          focusTarget="logo"
          variant="logo"
          initialUrl={uploaded.logoUrl ?? undefined}
          onChange={(file) => {
            setValue("logo", file, { shouldDirty: true, shouldValidate: true })
            setUploaded({ logoFileId: null, logoUrl: null })
          }}
          onRemove={() => {
            setValue("logo", undefined, {
              shouldDirty: true,
              shouldValidate: true,
            })
            setUploaded({ logoFileId: null, logoUrl: null })
          }}
        />
      </div>
      <div className="flex flex-col gap-4">
        <SectionHeader index={3} title="프로젝트 기획안" />
        <InputBox
          ref={externalLinkRef}
          value={watch("externalLink") ?? ""}
          onChange={(e) => {
            setValue("externalLink", e.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }}
          type="clear"
          onClear={() => {
            setValue("externalLink", "", {
              shouldDirty: true,
              shouldValidate: true,
            })
          }}
          state={errors.externalLink ? "error" : "default"}
          placeholder="Notion, Figma 등 기획안 링크를 첨부하세요."
          className="w-full"
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="weak"
          color="primary"
          disabled={!canTempSave}
          isLoading={isSaving}
          onClick={() => void handleTempSave()}
        >
          {tempSaveLabel}
        </Button>
        <Button
          type="submit"
          variant="fill"
          color="primary"
          disabled={isSaving}
          isLoading={isSaving}
        >
          다음
        </Button>
      </div>
    </form>
  )
})
