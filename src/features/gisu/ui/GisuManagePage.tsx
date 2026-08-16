import { isAxiosError } from "axios"
import { useMemo, useState } from "react"

import {
  useActivateGisu,
  useCreateGisu,
  useGisuList,
} from "@/features/gisu/hooks/useGisuAdmin"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import type { GisuResponse } from "@/features/gisu/api/gisuAdmin"

const GISU_PAGE_SIZE = 50

const dateInputClassName =
  "border-teal-gray-200 shadow-inner-neutral-2 box-border h-11 w-full max-w-52 rounded-[12px] border bg-white px-4 text-gray-900 outline-none"

export function GisuManagePage() {
  const addToast = useToastStore((s) => s.addToast)

  const { data: gisuPageData, isLoading } = useGisuList({
    page: 0,
    size: GISU_PAGE_SIZE,
  })
  const createGisuMutation = useCreateGisu()
  const activateGisuMutation = useActivateGisu()

  const [isCreating, setIsCreating] = useState(false)
  const [generationInput, setGenerationInput] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [activationTarget, setActivationTarget] = useState<GisuResponse | null>(
    null,
  )

  const sortedGisuList = useMemo(() => {
    const content = gisuPageData?.content ?? []
    return [...content].sort(
      (a, b) => Number(b.generation) - Number(a.generation),
    )
  }, [gisuPageData])

  const resetCreateForm = () => {
    setGenerationInput("")
    setStartDate("")
    setEndDate("")
    setIsCreating(false)
  }

  const handleCreate = async () => {
    const generation = Number(generationInput)
    if (!generationInput.trim() || Number.isNaN(generation) || generation < 1) {
      addToast({
        message: "기수 번호를 확인해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }
    if (!startDate || !endDate) {
      addToast({
        message: "활동 기간을 입력해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }
    if (startDate >= endDate) {
      addToast({
        message: "종료일은 시작일보다 빨라야 합니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    try {
      await createGisuMutation.mutateAsync({
        generation,
        startAt: `${startDate}T00:00:00Z`,
        endAt: `${endDate}T23:59:59Z`,
      })
      addToast({
        message: `${generation}기가 생성됐습니다.`,
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      resetCreateForm()
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined
      addToast({
        message:
          status === 409
            ? "이미 존재하는 기수입니다."
            : "기수 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }

  const handleActivateConfirm = async () => {
    if (!activationTarget) return
    const target = activationTarget
    setActivationTarget(null)

    try {
      await activateGisuMutation.mutateAsync(Number(target.gisuId))
      addToast({
        message: `${Number(target.generation)}기가 활성 기수로 변경됐습니다.`,
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch {
      addToast({
        message: "활성 기수 변경에 실패했습니다. 잠시 후 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }

  const formatDate = (value?: string) => {
    if (!value) return "-"
    return value.slice(0, 10)
  }

  return (
    <div className="flex w-full max-w-244 flex-col gap-8">
      <PageLabel
        breadcrumb={[
          { id: "settings", label: "설정" },
          { id: "gisu", label: "기수 관리" },
        ]}
        title="기수 관리"
        description="UMC 기수를 생성하고 활성 기수를 관리합니다."
        className="pl-3"
      />

      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full items-center justify-end">
          <Button
            size="m"
            color="primary"
            variant="fill"
            onClick={() => setIsCreating((prev) => !prev)}
            className="flex items-center gap-1 py-2.75 pr-3.5 pl-3"
          >
            <PlusIcon className="h-4 w-4" /> 기수 생성
          </Button>
        </div>

        {isCreating && (
          <div className="border-teal-gray-150 box-border flex w-full flex-col gap-6 rounded-[14px] border bg-white px-8 py-8.5">
            <h2 className="text-heading-7-semibold text-teal-gray-900">
              새 기수 생성
            </h2>

            <div className="flex w-full flex-col gap-3">
              <div className="flex w-full items-center gap-6">
                <label
                  htmlFor="gisu-generation"
                  className="text-body-1-medium text-teal-gray-600 w-18 shrink-0"
                >
                  기수 번호
                </label>
                <InputBox
                  id="gisu-generation"
                  value={generationInput}
                  onChange={(e) =>
                    setGenerationInput(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="11"
                  className="w-full max-w-52"
                />
              </div>

              <div className="flex w-full items-center gap-6">
                <label
                  htmlFor="gisu-start-date"
                  className="text-body-1-medium text-teal-gray-600 w-18 shrink-0"
                >
                  시작일
                </label>
                <input
                  id="gisu-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={dateInputClassName}
                />
              </div>

              <div className="flex w-full items-center gap-6">
                <label
                  htmlFor="gisu-end-date"
                  className="text-body-1-medium text-teal-gray-600 w-18 shrink-0"
                >
                  종료일
                </label>
                <input
                  id="gisu-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={dateInputClassName}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                size="m"
                color="neutral"
                variant="weak"
                onClick={resetCreateForm}
                className="rounded-[10px]"
              >
                취소
              </Button>
              <Button
                size="m"
                color="primary"
                variant="fill"
                onClick={handleCreate}
                disabled={createGisuMutation.isPending}
                className="rounded-[10px]"
              >
                생성
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-body-1-medium text-teal-gray-400 py-12 text-center">
            기수 정보를 불러오는 중입니다...
          </div>
        ) : sortedGisuList.length === 0 ? (
          <div className="text-body-1-medium text-teal-gray-400 py-12 text-center">
            등록된 기수가 없습니다.
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2">
            {sortedGisuList.map((gisu) => (
              <div
                key={String(gisu.gisuId)}
                className="border-teal-gray-150 box-border flex w-full items-center justify-between rounded-[14px] border bg-white px-6 py-5"
              >
                <div className="flex items-center gap-4">
                  <span className="text-heading-7-semibold text-teal-gray-900">
                    {Number(gisu.generation)}기
                  </span>
                  <span className="text-body-2-medium text-teal-gray-400">
                    {formatDate(gisu.startAt)} ~ {formatDate(gisu.endAt)}
                  </span>
                </div>

                {gisu.isActive ? (
                  <span className="text-label-1-semibold rounded-full bg-teal-50 px-3 py-1.5 text-teal-600">
                    활성
                  </span>
                ) : (
                  <Button
                    size="xs"
                    color="primary"
                    variant="weak"
                    onClick={() => setActivationTarget(gisu)}
                    disabled={activateGisuMutation.isPending}
                    className="w-fit px-3"
                  >
                    활성화
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CtaModal
        open={activationTarget != null}
        variant="warning"
        title={`${activationTarget ? Number(activationTarget.generation) : ""}기를 활성 기수로 변경하시겠습니까?`}
        content="활성 기수를 변경하면 서비스 전체에 즉시 반영됩니다."
        cancelText="돌아가기"
        confirmText="변경하기"
        onOpenChange={(open) => {
          if (!open) setActivationTarget(null)
        }}
        onCancel={() => setActivationTarget(null)}
        onConfirm={handleActivateConfirm}
      />
    </div>
  )
}
