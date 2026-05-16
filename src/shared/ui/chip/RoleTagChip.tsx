import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const roleTagChipVariants = cva(
  "inline-flex items-center justify-center rounded-[6px] px-2 py-[3px] text-label-2-medium text-center shadow-drop-neutral-2",
  {
    variants: {
      role: {
        central: "bg-role-central-200 text-role-central-600",
        campus: "bg-role-campus-200 text-role-campus-600",
        challenger: "bg-role-challenger-200 text-role-challenger-600",
      },
    },
  },
)

const ROLE_LABEL = {
  central: "중앙 운영진",
  campus: "교내 운영진",
  challenger: "챌린저",
} as const

export type Role = keyof typeof ROLE_LABEL

interface RoleTagChipProps {
  role: Role
  className?: string
}

export function RoleTagChip({ role, className }: RoleTagChipProps) {
  return (
    <span className={cn(roleTagChipVariants({ role }), className)}>
      {ROLE_LABEL[role]}
    </span>
  )
}
