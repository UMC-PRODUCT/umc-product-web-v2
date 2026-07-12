import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const roleTagChipVariants = cva(
  "inline-flex items-center justify-center text-center shadow-drop-neutral-2",
  {
    variants: {
      role: {
        hq: "bg-role-hq-200 text-role-hq-600",
        chapter: "bg-role-chapter-200 text-role-chapter-600",
        school: "bg-role-school-200 text-role-school-600",
        challenger: "bg-role-challenger-200 text-role-challenger-600",
        superadmin: "bg-role-superadmin-200 text-role-superadmin-600",
        product: "bg-role-product-200 text-role-product-600",
      },
      size: {
        default: "rounded-[6px] px-2 py-[3px] text-label-2-medium",
        lg: "h-8 gap-2.5 rounded-[8px] px-[9px] py-0.5 text-subtitle-2-medium",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

const ROLE_LABEL = {
  hq: "중앙 운영진",
  chapter: "지부장",
  school: "교내 운영진",
  challenger: "챌린저",
  superadmin: "슈퍼 어드민",
  product: "프로덕트",
} as const

export type Role = keyof typeof ROLE_LABEL

interface RoleTagChipProps {
  role: Role
  size?: "default" | "lg"
  className?: string
}

export function RoleTagChip({
  role,
  size = "default",
  className,
}: RoleTagChipProps) {
  return (
    <span className={cn(roleTagChipVariants({ role, size }), className)}>
      {ROLE_LABEL[role]}
    </span>
  )
}
