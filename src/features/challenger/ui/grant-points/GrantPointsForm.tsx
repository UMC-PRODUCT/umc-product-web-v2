import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import { grantChallengerPoints } from "@/features/challenger/api/challengerPoint"
import {
  formatSignedPoint,
  POINT_TYPE_META,
  POINT_TYPE_OPTIONS,
} from "@/features/challenger/model/enums"
import {
  type GrantPointFormData,
  grantPointSchema,
} from "@/features/challenger/model/grantPointSchema"
import { Dropdown } from "@/features/challenger/ui/shared/Dropdown"
import { FieldRow } from "@/features/challenger/ui/shared/FieldRow"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"

interface GrantPointsFormProps {
  challengerId: string
}

export function GrantPointsForm({ challengerId }: GrantPointsFormProps) {
  const addToast = useToastStore((state) => state.addToast)
  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<GrantPointFormData>({
    resolver: zodResolver(grantPointSchema),
    mode: "onChange",
    defaultValues: { description: "" },
  })

  useEffect(() => {
    reset({ description: "" })
  }, [challengerId, reset])

  const pointType = watch("pointType")
  const pointValue = watch("pointValue")
  const description = watch("description") ?? ""

  const meta = pointType ? POINT_TYPE_META[pointType] : null
  const requiresOverride = meta?.requiresOverride ?? false
  const effectivePoint = pointValue ?? meta?.defaultPoint

  const mutation = useMutation({
    mutationFn: (payload: GrantPointFormData) =>
      grantChallengerPoints(challengerId, {
        pointType: payload.pointType,
        // 가이드 문서 A-4: pointValue 미입력 시 null 전송 → pointType 의 기본 점수 사용
        pointValue: payload.pointValue ?? null,
        description: payload.description,
      }),
    onSuccess: () => {
      addToast({
        message: "상벌점이 부여되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      reset({ description: "" })
      void queryClient.invalidateQueries({
        queryKey: ["challenger", "info", challengerId],
      })
      void queryClient.invalidateQueries({
        queryKey: ["challenger", "member-profile"],
      })
    },
    onError: () => {
      addToast({
        message: "상벌점 부여에 실패했습니다. 잠시 후 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })

  const onSubmit = (data: GrantPointFormData) => {
    mutation.mutate(data)
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
          name="pointType"
          render={({ field }) => (
            <FieldRow
              label="상벌점 유형"
              required
              error={errors.pointType?.message}
              htmlFor="pointType"
              hint={
                meta && !requiresOverride
                  ? `기본 점수 ${formatSignedPoint(meta.defaultPoint)}점이 적용됩니다.`
                  : meta && requiresOverride
                    ? "기타 유형은 아래에서 점수를 직접 입력해야 합니다."
                    : undefined
              }
            >
              <Dropdown
                id="pointType"
                value={field.value}
                onChange={field.onChange}
                options={POINT_TYPE_OPTIONS}
                placeholder="상벌점 유형을 선택해주세요."
                error={Boolean(errors.pointType)}
              />
            </FieldRow>
          )}
        />

        <Controller
          control={control}
          name="pointValue"
          render={({ field }) => {
            const stringValue =
              field.value === undefined || Number.isNaN(field.value)
                ? ""
                : String(field.value)
            return (
              <FieldRow
                label={requiresOverride ? "점수" : "점수 덮어쓰기 (선택)"}
                htmlFor="pointValue"
                required={requiresOverride}
                error={errors.pointValue?.message}
                hint={
                  requiresOverride
                    ? "음수는 벌점, 양수는 상점입니다."
                    : "비워두면 위 유형의 기본 점수가 적용됩니다."
                }
              >
                <InputBox
                  id="pointValue"
                  type="default"
                  inputMode="numeric"
                  value={stringValue}
                  onChange={(event) => {
                    const next = event.target.value
                    if (next === "") {
                      field.onChange(undefined)
                      return
                    }
                    if (next === "-") {
                      // 음수 입력 도중. 일단 보류 — 숫자가 오면 그때 number 로 커밋.
                      field.onChange(next as unknown as number)
                      return
                    }
                    const parsed = Number(next)
                    field.onChange(
                      Number.isNaN(parsed)
                        ? (next as unknown as number)
                        : parsed,
                    )
                  }}
                  state={errors.pointValue ? "error" : "default"}
                  placeholder={
                    meta
                      ? `예) ${formatSignedPoint(meta.defaultPoint)}`
                      : "예) -2"
                  }
                  className="w-full max-w-none"
                />
              </FieldRow>
            )
          }}
        />
      </div>

      {meta && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-[12px] border border-teal-100 bg-teal-50 px-5 py-3",
            requiresOverride &&
              effectivePoint === undefined &&
              "border-teal-gray-100 bg-teal-gray-50",
          )}
        >
          <span className="text-caption-2-medium text-teal-gray-500">
            적용될 점수
          </span>
          <span
            className={cn(
              "text-subtitle-3-semibold tabular-nums",
              effectivePoint === undefined
                ? "text-teal-gray-400"
                : effectivePoint > 0
                  ? "text-teal-600"
                  : effectivePoint < 0
                    ? "text-error-500"
                    : "text-teal-gray-700",
            )}
          >
            {effectivePoint === undefined
              ? "—"
              : `${formatSignedPoint(effectivePoint)}점`}
          </span>
        </div>
      )}

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <FieldRow
            label="부여 사유"
            htmlFor="description"
            required
            error={errors.description?.message}
            hint={`${description.length}/200`}
          >
            <textarea
              id="description"
              rows={3}
              maxLength={200}
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              placeholder="상벌점 부여 사유를 입력해주세요."
              className={cn(
                "border-teal-gray-300 shadow-inner-neutral-2 text-body-1-regular text-teal-gray-900 placeholder:text-teal-gray-400 hover:bg-teal-gray-50 w-full resize-none rounded-[12px] border bg-white px-4 py-3 transition-colors outline-none focus-within:border-teal-400 focus-within:bg-teal-50",
                errors.description &&
                  "border-error-400 bg-error-50/60 text-error-500",
              )}
            />
          </FieldRow>
        )}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="fill"
          color="primary"
          size="m"
          isLoading={mutation.isPending}
        >
          상벌점 부여
        </Button>
      </div>
    </form>
  )
}
