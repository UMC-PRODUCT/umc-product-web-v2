import type { ToastItem } from "@/shared/ui/toast/useToastStore"

type AddToastFn = (options: Omit<ToastItem, "id">) => void

export function showSchoolAlreadyExistsToast(addToast: AddToastFn) {
  addToast({
    message: "이미 등록된 학교 정보입니다.",
    color: "red",
    variant: "deep",
    type: "default",
    duration: 3000,
  })
}

export function showRequiredFieldsMissingToast(addToast: AddToastFn) {
  addToast({
    message: "필수 항목을 입력해주세요.",
    color: "red",
    variant: "deep",
    type: "default",
    duration: 3000,
  })
}

export function showSchoolEditCompletedToast(addToast: AddToastFn) {
  addToast({
    message: "학교 정보 수정이 완료됐습니다.",
    color: "primary",
    variant: "deep",
    type: "default",
    duration: 3000,
  })
}

export function showSchoolRegisterCompletedToast(addToast: AddToastFn) {
  addToast({
    message: "학교 등록이 완료됐습니다.",
    color: "primary",
    variant: "deep",
    type: "default",
    duration: 3000,
  })
}

export function showSchoolDeletedToast(
  addToast: AddToastFn,
  onUndo?: () => void,
) {
  addToast({
    message: "학교 정보가 삭제됐습니다.",
    color: "primary",
    variant: "deep",
    type: "default",
    duration: 6000,
    action: {
      label: "되돌리기",
      onClick: () => {
        onUndo?.()
      },
    },
  })
}
