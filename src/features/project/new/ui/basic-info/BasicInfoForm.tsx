import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import { searchMembers } from "@/features/challenger/api/member"
import { Dropdown } from "@/features/challenger/ui/shared/Dropdown"
import {
  addProjectMember,
  createProjectDraft,
  updateProjectDraft,
  uploadFileFlow,
} from "@/features/project/new/api"
import { toMemberItem } from "@/features/project/new/api/memberAdapter"
import { getActiveGisu } from "@/shared/api/gisu"
import { getMe } from "@/shared/api/me"
import InfoCircleIcon from "@/shared/assets/icon/infomation/InfoCircleIcon"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"
import { Button } from "@/shared/ui/Button"
import { ImageUploader } from "@/shared/ui/ImageUploader"
import { useViewModeStore } from "@/shared/view-mode"

import {
  type BasicInfoFormData,
  basicInfoSchema,
} from "../../model/basicInfoSchema"
import { useProjectRegisterStore } from "../../model/useProjectRegisterStore"
import { SectionHeader } from "../shared/SectionHeader"
import { ProjectCardForm } from "./ProjectCardForm"

import type { MemberItem } from "@/shared/ui/searchbar/MemberSearchBar"

interface BasicInfoFormProps {
  onNext: () => void
}

export function BasicInfoForm({ onNext }: BasicInfoFormProps) {
  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMe })
  const me = meQuery.data

  const viewMode = useViewModeStore((s) => s.mode)
  const activeGisuQuery = useQuery({
    queryKey: ["gisu", "active"],
    queryFn: getActiveGisu,
    staleTime: 5 * 60 * 1000,
  })
  const activeGisuId = activeGisuQuery.data?.gisuId

  const pmListQuery = useQuery({
    queryKey: ["member", "list", { part: "PLAN", gisuId: activeGisuId }],
    queryFn: () =>
      searchMembers({
        part: "PLAN",
        gisuId: activeGisuId != null ? String(activeGisuId) : undefined,
        size: 200,
      }),
    enabled: activeGisuId != null,
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

  const allPmMembers = useMemo(
    () => (pmListQuery.data?.page.content ?? []).map(toMemberItem),
    [pmListQuery.data],
  )

  const pm1Options = useMemo(() => {
    const filtered =
      viewMode === "pm" && me
        ? allPmMembers.filter((m) => m.id === me.id)
        : allPmMembers
    return filtered.map((m) => ({
      value: m.id,
      label: `${m.nickname}/${m.name} · ${m.university}`,
    }))
  }, [allPmMembers, viewMode, me])

  const pm2Options = useMemo(() => {
    const excludeIds = new Set(
      [pm1Member?.id, viewMode === "pm" && me ? me.id : undefined].filter(
        Boolean,
      ),
    )
    return allPmMembers
      .filter((m) => !excludeIds.has(m.id))
      .map((m) => ({
        value: m.id,
        label: `${m.nickname}/${m.name} · ${m.university}`,
      }))
  }, [allPmMembers, pm1Member, viewMode, me])

  const thumbnailRef = useRef<HTMLButtonElement>(null)
  const logoRef = useRef<HTMLButtonElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    getValues,
    reset,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    shouldFocusError: false,
  })

  useEffect(() => {
    if (!basicDraftFields) return
    const { title, description } = basicDraftFields
    if (title) setValue("title", title, { shouldDirty: false })
    if (description)
      setValue("description", description, { shouldDirty: false })
  }, [basicDraftFields, setValue])

  const onInvalid = (fieldErrors: typeof errors) => {
    const values = getValues()

    let message = "모든 항목을 입력해 주세요."
    let focusFn: (() => void) | null = null

    if (fieldErrors.title) {
      message = "프로젝트 이름을 입력해 주세요."
      focusFn = () => setFocus("title")
    } else if (fieldErrors.description) {
      message = "프로젝트 한 줄 소개를 입력해 주세요."
      focusFn = () => setFocus("description")
    } else if (!(values.thumbnail instanceof File) && !uploaded.thumbnailUrl) {
      message = "프로젝트 대표 이미지를 업로드해 주세요."
      focusFn = () => thumbnailRef.current?.focus()
    } else if (!(values.logo instanceof File) && !uploaded.logoUrl) {
      message = "프로젝트 로고를 업로드해 주세요."
      focusFn = () => logoRef.current?.focus()
    }

    addToast({
      message,
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })

    if (focusFn) setTimeout(focusFn, 0)
  }

  const isPmChanged = savedSnapshot
    ? pm1Member !== savedSnapshot.pm1 ||
      pm2Member !== savedSnapshot.pm2 ||
      isMultiPm !== savedSnapshot.isMultiPm
    : pm1Member !== null || pm2Member !== null || isMultiPm

  const hasDirtyFields = Object.keys(dirtyFields).length > 0
  const hasUnsavedChanges = hasDirtyFields || isPmChanged
  const canTempSave = hasUnsavedChanges && !isSaving
  const tempSaveLabel =
    hasSavedOnce && !hasUnsavedChanges ? "저장 완료" : "임시 저장"

  const handleTempSave = async () => {
    const values = getValues()
    setIsSaving(true)
    try {
      let resolvedProjectId = projectId
      if (!resolvedProjectId) {
        if (!gisuId) throw new Error("기수 정보를 불러오는 중입니다.")
        const created = await createProjectDraft({
          gisuId,
          productOwnerMemberId: pm1Member ? Number(pm1Member.id) : undefined,
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
      })

      const prevPm2Id = savedSnapshot?.pm2?.id
      const currPm2Id = pm2Member?.id
      if (currPm2Id && currPm2Id !== prevPm2Id) {
        await addProjectMember(resolvedProjectId, {
          memberId: Number(currPm2Id),
          part: "PLAN",
        })
      }

      setPmInfo({ isMultiPm, pm1: pm1Member, pm2: pm2Member })
      reset(values, { keepValues: true, keepDirty: false })
      setSavedSnapshot({ pm1: pm1Member, pm2: pm2Member, isMultiPm })
      setHasSavedOnce(true)
      addToast({
        message: "작성한 내용이 임시 저장되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch {
      addToast({
        message: "임시 저장에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onSubmit = (data: BasicInfoFormData) => {
    setBasicInfo(data)
    setPmInfo({ isMultiPm, pm1: pm1Member, pm2: pm2Member })
    addToast({
      message: "작성한 내용이 저장되었습니다.",
      color: "primary",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
    onNext()
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!pm1Member) {
      setPm1Error(true)
      addToast({
        message: "PM을 선택해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
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
      return
    }
    void handleSubmit(onSubmit, onInvalid)(e)
  }

  const displayNickname = pm1Member?.nickname ?? me?.nickname ?? "-"
  const displayName = pm1Member?.name ?? me?.name ?? "-"
  const displayUniversity =
    formatSchoolName(pm1Member?.university ?? me?.schoolName) || "-"

  const pmDropdownDisabled = activeGisuId == null || pmListQuery.isLoading

  return (
    <form
      noValidate
      onSubmit={handleFormSubmit}
      className="flex flex-col justify-start gap-14 px-4 pt-4"
    >
      <div className="flex flex-col gap-4">
        <SectionHeader index={1} title="프로젝트 카드" />
        <div className="flex items-start gap-6">
          <ProjectCardForm
            nickname={displayNickname}
            name={displayName}
            university={displayUniversity}
            subPm={pm2Member}
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
          <div className="flex w-78 shrink-0 flex-col gap-2">
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
        />
      </div>
      <div className="flex justify-between">
        <Button
          type="button"
          variant="weak"
          color="primary"
          disabled={!canTempSave}
          isLoading={isSaving}
          onClick={handleTempSave}
        >
          {tempSaveLabel}
        </Button>
        <Button type="submit" variant="fill" color="primary">
          다음
        </Button>
      </div>
    </form>
  )
}
