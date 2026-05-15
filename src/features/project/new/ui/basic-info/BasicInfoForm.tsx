import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import { searchMembers } from "@/features/challenger/api/member"
import {
  addProjectMember,
  createProjectDraft,
  memberKeys,
  updateProjectDraft,
  uploadFileFlow,
} from "@/features/project/new/api"
import { toMemberItem } from "@/features/project/new/api/memberAdapter"
import { getMe } from "@/shared/api/me"
import InfoCircleIcon from "@/shared/assets/icon/infomation/InfoCircleIcon"
import { Button } from "@/shared/ui/Button"
import { ImageUploader } from "@/shared/ui/ImageUploader"
import {
  type MemberItem,
  MemberSearchBar,
} from "@/shared/ui/searchbar/MemberSearchBar"

import {
  type BasicInfoFormData,
  basicInfoSchema,
} from "../../model/basicInfoSchema"
import { useProjectRegisterStore } from "../../model/useProjectRegisterStore"
import { SectionHeader } from "../shared/SectionHeader"
import { PlanningLinkInput } from "./PlanningLinkInput"
import { ProjectCardForm } from "./ProjectCardForm"

interface BasicInfoFormProps {
  onNext: () => void
}

function useDebounced<T>(value: T, delayMs = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(handle)
  }, [value, delayMs])
  return debounced
}

export function BasicInfoForm({ onNext }: BasicInfoFormProps) {
  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMe })
  const me = meQuery.data

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
  const [pm1Value, setPm1Value] = useState(
    storePmInfo.pm1
      ? `${storePmInfo.pm1.nickname}/${storePmInfo.pm1.name}`
      : "",
  )
  const [pm1Focused, setPm1Focused] = useState(false)
  const [pm1Selected, setPm1Selected] = useState(storePmInfo.pm1 !== null)
  const [pm1Member, setPm1Member] = useState<MemberItem | null>(storePmInfo.pm1)
  const [pm1Error, setPm1Error] = useState(false)

  const [pm2Value, setPm2Value] = useState(
    storePmInfo.pm2
      ? `${storePmInfo.pm2.nickname}/${storePmInfo.pm2.name}`
      : "",
  )
  const [pm2Focused, setPm2Focused] = useState(false)
  const [pm2Selected, setPm2Selected] = useState(storePmInfo.pm2 !== null)
  const [pm2Member, setPm2Member] = useState<MemberItem | null>(storePmInfo.pm2)
  const [pm2Error, setPm2Error] = useState(false)

  const debouncedPm1 = useDebounced(pm1Value)
  const debouncedPm2 = useDebounced(pm2Value)

  const pm1SearchEnabled =
    pm1Focused && !pm1Selected && debouncedPm1.length >= 2
  const pm2SearchEnabled =
    pm2Focused && !pm2Selected && debouncedPm2.length >= 2

  const pm1Query = useQuery({
    queryKey: memberKeys.search(debouncedPm1),
    queryFn: () => searchMembers({ keyword: debouncedPm1, size: 20 }),
    enabled: pm1SearchEnabled,
    placeholderData: (prev) => prev,
  })

  const pm2Query = useQuery({
    queryKey: memberKeys.search(debouncedPm2),
    queryFn: () => searchMembers({ keyword: debouncedPm2, size: 20 }),
    enabled: pm2SearchEnabled,
    placeholderData: (prev) => prev,
  })

  const pm1Items: MemberItem[] =
    pm1Focused && !pm1Selected
      ? (pm1Query.data?.page.content ?? []).map(toMemberItem)
      : []
  const pm2Items: MemberItem[] =
    pm2Focused && !pm2Selected
      ? (pm2Query.data?.page.content ?? []).map(toMemberItem)
      : []

  const thumbnailRef = useRef<HTMLButtonElement>(null)
  const logoRef = useRef<HTMLButtonElement>(null)
  const pm1Ref = useRef<HTMLInputElement>(null)
  const pm2Ref = useRef<HTMLInputElement>(null)

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
    const { title, description, planningLink } = basicDraftFields
    if (title) setValue("title", title, { shouldDirty: false })
    if (description)
      setValue("description", description, { shouldDirty: false })
    if (planningLink)
      setValue("planningLink", planningLink, { shouldDirty: false })
  }, [basicDraftFields, setValue])

  const onInvalid = (fieldErrors: typeof errors) => {
    const values = getValues()

    let message = "모든 항목을 입력해주세요"
    let focusFn: (() => void) | null = null

    if (!(values.thumbnail instanceof File) && !uploaded.thumbnailUrl) {
      message = "썸네일 이미지를 등록해주세요!"
      focusFn = () => thumbnailRef.current?.focus()
    } else if (fieldErrors.title) {
      message = "서비스 제목을 입력해주세요!"
      focusFn = () => setFocus("title")
    } else if (fieldErrors.description) {
      message = "프로젝트 소개를 입력해주세요!"
      focusFn = () => setFocus("description")
    } else if (!(values.logo instanceof File) && !uploaded.logoUrl) {
      message = "로고 이미지를 등록해주세요!"
      focusFn = () => logoRef.current?.focus()
    } else if (fieldErrors.planningLink) {
      message = "기획서 링크를 입력해주세요!"
      focusFn = () => setFocus("planningLink")
    }

    addToast({
      message,
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3,
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
        externalLink: values.planningLink,
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
        duration: 3,
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
      duration: 3,
    })
    onNext()
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!pm1Member) {
      setPm1Error(true)
      addToast({
        message: "PM을 선택해주세요!",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3,
      })
      setTimeout(() => pm1Ref.current?.focus(), 0)
      return
    }
    if (isMultiPm && !pm2Member) {
      setPm2Error(true)
      addToast({
        message: "두 번째 PM을 선택해주세요!",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3,
      })
      setTimeout(() => pm2Ref.current?.focus(), 0)
      return
    }
    void handleSubmit(onSubmit, onInvalid)(e)
  }

  const displayNickname = pm1Member?.nickname ?? me?.nickname ?? "-"
  const displayName = pm1Member?.name ?? me?.name ?? "-"
  const displayUniversity = pm1Member?.university ?? me?.schoolName ?? "-"

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
            <MemberSearchBar
              ref={pm1Ref}
              value={pm1Value}
              onChange={(e) => {
                setPm1Value(e.target.value)
                setPm1Selected(false)
                setPm1Member(null)
              }}
              onClear={() => {
                setPm1Value("")
                setPm1Selected(false)
                setPm1Member(null)
              }}
              isSelected={pm1Selected}
              error={pm1Error}
              onFocus={() => setPm1Focused(true)}
              onBlur={() => setPm1Focused(false)}
              placeholder={
                isMultiPm
                  ? "메인 PM 닉네임/이름을 선택하세요."
                  : "PM 닉네임/이름을 선택하세요."
              }
              items={pm1Items}
              onSelect={(member) => {
                setPm1Value(`${member.nickname}/${member.name}`)
                setPm1Selected(true)
                setPm1Member(member)
                setPm1Error(false)
              }}
            />
            {isMultiPm && (
              <MemberSearchBar
                ref={pm2Ref}
                value={pm2Value}
                onChange={(e) => {
                  setPm2Value(e.target.value)
                  setPm2Selected(false)
                  setPm2Member(null)
                }}
                onClear={() => {
                  setPm2Value("")
                  setPm2Selected(false)
                  setPm2Member(null)
                }}
                isSelected={pm2Selected}
                error={pm2Error}
                onFocus={() => setPm2Focused(true)}
                onBlur={() => setPm2Focused(false)}
                placeholder="PM 닉네임/이름을 선택하세요."
                items={pm2Items}
                onSelect={(member) => {
                  setPm2Value(`${member.nickname}/${member.name}`)
                  setPm2Selected(true)
                  setPm2Member(member)
                  setPm2Error(false)
                }}
              />
            )}
            <button
              type="button"
              onClick={() => {
                if (isMultiPm) {
                  setPm2Value("")
                  setPm2Selected(false)
                  setPm2Member(null)
                  setPm2Error(false)
                }
                setIsMultiPm((prev) => !prev)
              }}
              className="text-body-2-medium text-teal-gray-400 flex items-center gap-1 self-end pr-3.5 font-medium underline decoration-solid underline-offset-auto"
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
      <div className="flex flex-col gap-4">
        <SectionHeader index={3} title="기획서 링크" />
        <PlanningLinkInput register={register} error={errors.planningLink} />
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
