import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import { createChallengerRecord } from "@/features/challenger/api/challengerRecord"
import {
  getAllGisu,
  getChaptersWithSchools,
} from "@/features/challenger/api/organization"
import {
  type CreateRecordFormData,
  createRecordSchema,
} from "@/features/challenger/model/createRecordSchema"
import {
  PART_OPTIONS,
  ROLE_TYPE_OPTIONS,
  roleNeedsPart,
} from "@/features/challenger/model/enums"
import { Dropdown } from "@/features/challenger/ui/shared/Dropdown"
import { FieldRow } from "@/features/challenger/ui/shared/FieldRow"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"

import { GeneratedCodeCard } from "./GeneratedCodeCard"

import type { DropdownOption } from "@/features/challenger/ui/shared/Dropdown"

export function CreateRecordForm() {
  const addToast = useToastStore((state) => state.addToast)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRecordFormData>({
    resolver: zodResolver(createRecordSchema),
    mode: "onChange",
    defaultValues: { memberName: "" },
  })

  const watchedGisuId = watch("gisuId")
  const watchedChapterId = watch("chapterId")
  const watchedRoleType = watch("challengerRoleType")
  const hasGisu = Boolean(watchedGisuId)
  const hasChapter = Boolean(watchedChapterId)
  const showPartField = roleNeedsPart(watchedRoleType)

  const gisuQuery = useQuery({
    queryKey: ["challenger", "gisu", "all"],
    queryFn: getAllGisu,
  })

  const chaptersQuery = useQuery({
    queryKey: ["challenger", "chapters", "with-schools", watchedGisuId],
    queryFn: () => getChaptersWithSchools(watchedGisuId),
    enabled: hasGisu,
  })

  const gisuOptions = useMemo<DropdownOption<string>[]>(
    () =>
      (gisuQuery.data?.gisuList ?? []).map((item) => ({
        value: item.gisuId,
        label: `${item.gisu}기${item.isActive ? " (현재 기수)" : ""}`,
      })),
    [gisuQuery.data],
  )

  const chapterOptions = useMemo<DropdownOption<string>[]>(
    () =>
      (chaptersQuery.data?.chapters ?? []).map((chapter) => ({
        value: chapter.chapterId,
        label: chapter.chapterName,
      })),
    [chaptersQuery.data],
  )

  const schoolOptions = useMemo<DropdownOption<string>[]>(() => {
    if (!hasChapter) return []
    const chapter = chaptersQuery.data?.chapters.find(
      (item) => item.chapterId === watchedChapterId,
    )
    return (chapter?.schools ?? []).map((school) => ({
      value: school.schoolId,
      label: school.schoolName,
    }))
  }, [chaptersQuery.data, hasChapter, watchedChapterId])

  useEffect(() => {
    setValue("chapterId", "", { shouldDirty: false, shouldValidate: false })
    setValue("schoolId", "", { shouldDirty: false, shouldValidate: false })
  }, [watchedGisuId, setValue])

  useEffect(() => {
    setValue("schoolId", "", { shouldDirty: false, shouldValidate: false })
  }, [watchedChapterId, setValue])

  // 역할이 비파트류로 바뀌면 part 입력값을 정리한다 (제출 시 ADMIN 으로 자동 채워짐).
  useEffect(() => {
    if (!showPartField) {
      setValue("part", undefined, {
        shouldDirty: false,
        shouldValidate: false,
      })
    }
  }, [showPartField, setValue])

  const mutation = useMutation({
    mutationFn: (payload: CreateRecordFormData) =>
      createChallengerRecord({
        gisuId: payload.gisuId,
        chapterId: payload.chapterId,
        schoolId: payload.schoolId,
        challengerRoleType: payload.challengerRoleType,
        memberName: payload.memberName,
        // 비파트 역할(회장·부회장·운영팀원 등) 은 운영진 파트(ADMIN) 로 채워 보낸다.
        part: payload.part ?? "ADMIN",
      }),
    onSuccess: () => {
      addToast({
        message: "코드가 발급되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3,
      })
    },
    onError: () => {
      addToast({
        message: "코드 발급에 실패했습니다. 잠시 후 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3,
      })
    },
  })

  const onSubmit = (data: CreateRecordFormData) => {
    mutation.mutate(data)
  }

  const handleReset = () => {
    reset({ memberName: "" })
    mutation.reset()
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
    >
      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
        <Controller
          control={control}
          name="gisuId"
          render={({ field }) => (
            <FieldRow
              label="기수"
              required
              htmlFor="gisuId"
              error={errors.gisuId?.message}
            >
              <Dropdown<string>
                id="gisuId"
                value={field.value || undefined}
                onChange={field.onChange}
                options={gisuOptions}
                placeholder={
                  gisuQuery.isLoading
                    ? "기수를 불러오는 중..."
                    : gisuOptions.length === 0
                      ? "기수 정보가 없습니다."
                      : "기수를 선택해주세요."
                }
                disabled={gisuQuery.isLoading}
                error={Boolean(errors.gisuId)}
              />
            </FieldRow>
          )}
        />

        <Controller
          control={control}
          name="chapterId"
          render={({ field }) => (
            <FieldRow
              label="지부"
              required
              htmlFor="chapterId"
              error={errors.chapterId?.message}
            >
              <Dropdown<string>
                id="chapterId"
                value={field.value || undefined}
                onChange={field.onChange}
                options={chapterOptions}
                placeholder={
                  !hasGisu
                    ? "기수를 먼저 선택해주세요."
                    : chaptersQuery.isLoading
                      ? "지부를 불러오는 중..."
                      : chapterOptions.length === 0
                        ? "선택 가능한 지부가 없습니다."
                        : "지부를 선택해주세요."
                }
                disabled={!hasGisu || chaptersQuery.isLoading}
                error={Boolean(errors.chapterId)}
              />
            </FieldRow>
          )}
        />

        <Controller
          control={control}
          name="schoolId"
          render={({ field }) => (
            <FieldRow
              label="학교"
              required
              htmlFor="schoolId"
              error={errors.schoolId?.message}
            >
              <Dropdown<string>
                id="schoolId"
                value={field.value || undefined}
                onChange={field.onChange}
                options={schoolOptions}
                placeholder={
                  !hasChapter
                    ? "지부를 먼저 선택해주세요."
                    : schoolOptions.length === 0
                      ? "선택 가능한 학교가 없습니다."
                      : "학교를 선택해주세요."
                }
                disabled={!hasChapter}
                error={Boolean(errors.schoolId)}
              />
            </FieldRow>
          )}
        />

        <Controller
          control={control}
          name="challengerRoleType"
          render={({ field }) => (
            <FieldRow
              label="역할"
              required
              htmlFor="challengerRoleType"
              error={errors.challengerRoleType?.message}
            >
              <Dropdown
                id="challengerRoleType"
                value={field.value}
                onChange={field.onChange}
                options={ROLE_TYPE_OPTIONS}
                placeholder="역할을 선택해주세요."
                error={Boolean(errors.challengerRoleType)}
              />
            </FieldRow>
          )}
        />

        {showPartField ? (
          <Controller
            control={control}
            name="part"
            render={({ field }) => (
              <FieldRow
                label="파트"
                required
                htmlFor="part"
                error={errors.part?.message}
              >
                <Dropdown
                  id="part"
                  value={field.value}
                  onChange={field.onChange}
                  options={PART_OPTIONS}
                  placeholder="파트를 선택해주세요."
                  error={Boolean(errors.part)}
                />
              </FieldRow>
            )}
          />
        ) : (
          <FieldRow
            label="파트"
            hint={
              watchedRoleType
                ? "선택한 역할은 특정 파트에 묶이지 않습니다. (운영진으로 자동 처리)"
                : "역할을 먼저 선택해주세요."
            }
          >
            <div className="border-teal-gray-200 bg-teal-gray-50 text-body-2-medium text-teal-gray-400 inline-flex h-11 w-full items-center rounded-[12px] border px-4">
              파트 선택 불필요
            </div>
          </FieldRow>
        )}

        <Controller
          control={control}
          name="memberName"
          render={({ field }) => (
            <FieldRow
              label="이름"
              required
              htmlFor="memberName"
              error={errors.memberName?.message}
            >
              <InputBox
                id="memberName"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                onClear={() => field.onChange("")}
                type="clear"
                state={errors.memberName ? "error" : "default"}
                placeholder="회원 이름을 입력해주세요."
                className="w-full max-w-none"
              />
            </FieldRow>
          )}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          size="m"
          onClick={handleReset}
          disabled={mutation.isPending}
        >
          초기화
        </Button>
        <Button
          type="submit"
          variant="fill"
          color="primary"
          size="m"
          isLoading={mutation.isPending}
        >
          코드 발급
        </Button>
      </div>

      {mutation.data && <GeneratedCodeCard record={mutation.data} />}
    </form>
  )
}
