import { cva } from "class-variance-authority"
import { Settings } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { ROLE_TAG_LABEL } from "@/shared/model/domain"

import type { RoleTag } from "@/shared/model/domain"

const roleTagChipVariants = cva(
  "inline-flex items-center justify-center text-center shadow-drop-neutral-2",
  {
    variants: {
      role: {
        hq: "bg-role-hq-200 text-role-hq-600",
        "central-president": "bg-role-hq-200 text-role-hq-600",
        "central-vice-president": "bg-role-hq-200 text-role-hq-600",
        chapter: "bg-role-chapter-200 text-role-chapter-600",
        school: "bg-role-school-200 text-role-school-600",
        "school-president": "bg-role-school-200 text-role-school-600",
        "school-vice-president": "bg-role-school-200 text-role-school-600",
        challenger: "bg-role-challenger-200 text-role-challenger-600",
        superadmin: "bg-role-superadmin-200 text-role-superadmin-600",
        product: "bg-role-product-200 text-role-product-600",
      },
      size: {
        default: "gap-1 rounded-[6px] px-2 py-[3px] text-label-2-medium",
        lg: "h-8 gap-2.5 rounded-[8px] px-[9px] py-0.5 text-subtitle-2-medium",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

interface RoleTagChipProps {
  role: RoleTag
  size?: "default" | "lg"
  className?: string
}

export function RoleTagChip({
  role,
  size = "default",
  className,
}: RoleTagChipProps) {
  const productIconClassName = size === "lg" ? "size-4" : "size-3"

  return (
    <span className={cn(roleTagChipVariants({ role, size }), className)}>
      {role === "product" && (
        <Settings
          aria-hidden
          className={cn("shrink-0", productIconClassName)}
          strokeWidth={1.5}
        />
      )}
      {ROLE_TAG_LABEL[role]}
    </span>
  )
}
