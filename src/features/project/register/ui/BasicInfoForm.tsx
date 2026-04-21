import { zodResolver } from "@hookform/resolvers/zod"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
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
} from "../model/basicInfoSchema"
import { useProjectRegisterStore } from "../model/useProjectRegisterStore"
import { PlanningLinkInput } from "./PlanningLinkInput"
import { ProjectCardForm } from "./ProjectCardForm"
import { SectionHeader } from "./SectionHeader"

interface BasicInfoFormProps {
  onNext: () => void
}

const MOCK_USER = { nickname: "닉넴", name: "아무개", university: "OO대 OOO" }

const MOCK_MEMBERS: MemberItem[] = [
  { nickname: "이삭", name: "강지훈", university: "OO대학교" },
  { nickname: "이방토", name: "이예원", university: "OO대학교" },
  { nickname: "헤일리", name: "한현서", university: "OO대학교" },
  { nickname: "주디", name: "양혜원", university: "OO대학교" },
  { nickname: "준오", name: "오창준", university: "OO대학교" },
  { nickname: "하늘", name: "박경운", university: "OO대학교" },
  { nickname: "벨라", name: "황지원", university: "OO대학교" },
]

export function BasicInfoForm({ onNext }: BasicInfoFormProps) {
  const setBasicInfo = useProjectRegisterStore((s) => s.setBasicInfo)
  const addToast = useToastStore((s) => s.addToast)
  const [isSaving, setIsSaving] = useState(false)
  const [hasSavedOnce, setHasSavedOnce] = useState(false)
  const [savedSnapshot, setSavedSnapshot] = useState<{
    pm1: MemberItem | null
    pm2: MemberItem | null
    isMultiPm: boolean
  } | null>(null)
  const [isMultiPm, setIsMultiPm] = useState(false)
  const [pm1Value, setPm1Value] = useState("")
  const [pm1Focused, setPm1Focused] = useState(false)
  const [pm1Selected, setPm1Selected] = useState(false)
  const [pm1Member, setPm1Member] = useState<MemberItem | null>(null)
  const [pm1Error, setPm1Error] = useState(false)
  const [pm2Value, setPm2Value] = useState("")
  const [pm2Focused, setPm2Focused] = useState(false)
  const [pm2Selected, setPm2Selected] = useState(false)
  const [pm2Member, setPm2Member] = useState<MemberItem | null>(null)
  const [pm2Error, setPm2Error] = useState(false)

  const filterMembers = (value: string, focused: boolean) =>
    focused
      ? value.trim()
        ? MOCK_MEMBERS.filter(
            (m) => m.nickname.includes(value) || m.name.includes(value),
          )
        : MOCK_MEMBERS
      : []

  const pm1Items = filterMembers(pm1Value, pm1Focused)
  const pm2Items = filterMembers(pm2Value, pm2Focused)

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
    formState: { errors, isDirty },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    shouldFocusError: false,
  })

  const onInvalid = (fieldErrors: typeof errors) => {
    const values = getValues()

    let message = "모든 항목을 입력해주세요"
    let focusFn: (() => void) | null = null

    if (!(values.thumbnail instanceof File)) {
      message = "썸네일 이미지를 등록해주세요!"
      focusFn = () => thumbnailRef.current?.focus()
    } else if (fieldErrors.title) {
      message = "서비스 제목을 입력해주세요!"
      focusFn = () => setFocus("title")
    } else if (fieldErrors.description) {
      message = "프로젝트 소개를 입력해주세요!"
      focusFn = () => setFocus("description")
    } else if (!(values.logo instanceof File)) {
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

  const hasUnsavedChanges = isDirty || isPmChanged
  const canTempSave = hasUnsavedChanges && !isSaving
  const tempSaveLabel =
    hasSavedOnce && !hasUnsavedChanges ? "저장 완료" : "임시 저장"

  const handleTempSave = async () => {
    setIsSaving(true)
    try {
      // TODO: API 연결
      reset(getValues(), { keepValues: true, keepDirty: false })
      setSavedSnapshot({ pm1: pm1Member, pm2: pm2Member, isMultiPm })
      setHasSavedOnce(true)
      addToast({
        message: "작성한 내용이 임시 저장되었습니다.",
        color: "primary",
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

  return (
    <form
      noValidate
      onSubmit={handleFormSubmit}
      className="flex flex-col justify-start gap-14 pt-4"
    >
      <div className="flex flex-col gap-4">
        <SectionHeader index={1} title="프로젝트 카드" />
        <div className="flex items-start gap-6">
          <ProjectCardForm
            nickname={pm1Member?.nickname ?? MOCK_USER.nickname}
            name={pm1Member?.name ?? MOCK_USER.name}
            university={pm1Member?.university ?? MOCK_USER.university}
            subPm={pm2Member}
            register={register}
            setValue={(name, value, options) =>
              setValue(name, value, { shouldDirty: true, ...options })
            }
            watch={watch}
            errors={errors}
            thumbnailRef={thumbnailRef}
          />
          <div className="flex w-78 shrink-0 flex-col gap-2">
            <MemberSearchBar
              ref={pm1Ref}
              value={pm1Value}
              onChange={(e) => {
                setPm1Value(e.target.value)
                setPm1Selected(false)
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
          onChange={(file) =>
            setValue("logo", file, { shouldDirty: true, shouldValidate: true })
          }
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
