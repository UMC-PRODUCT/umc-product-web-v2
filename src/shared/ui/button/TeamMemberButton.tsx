import PersonIcon from "@/shared/assets/icon/people/PersonIcon"

/**
 * 사용되는 곳: 프로젝트 상세 카드 내 팀원 정보 확인 버튼
 * 피그마 기준: Button 내 사람 아이콘 포함 버튼
 */
import type { ButtonHTMLAttributes } from "react"

type Variant = "fill" | "weak"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "fill" | "weak"
}

export function TeamMemberButton({
  variant = "fill",
  disabled = false,
  className,
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex h-11 min-h-[2.75rem] min-w-[3.25rem] items-center justify-center gap-2.5 rounded-xl px-4 py-[10px] transition-colors ${getBgClass(variant, disabled)} ${className ?? ""} `}
      disabled={disabled}
      {...props}
    >
      <PersonIcon className={`h-6 w-6 ${getIconColor(variant)}`} />
    </button>
  )
}

function getBgClass(variant: Variant, disabled: boolean) {
  if (disabled) return "bg-gray-200"

  if (variant === "fill") {
    return "bg-teal-gray-600 hover:bg-teal-gray-700"
  }

  return "bg-teal-gray-150 hover:bg-teal-gray-300/50"
}

function getIconColor(variant: Variant) {
  return variant === "fill" ? "text-teal-gray-50" : "text-teal-gray-600"
}
