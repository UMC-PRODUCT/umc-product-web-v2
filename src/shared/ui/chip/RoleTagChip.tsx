import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const roleTagChipVariants = cva(
  "inline-flex h-6 px-2.5 items-center justify-center rounded-[6px] py-0.5 text-label-2-medium text-teal-gray-800 shadow-drop-neutral-2",
  {
    variants: {
      role: {
        plan: "w-9 bg-chip-plan-300",
        design: "w-15 bg-chip-design-300",
        web: "w-11.5 bg-chip-web-300",
        ios: "w-10 bg-chip-ios-300",
        android: "w-16.5 bg-chip-android-300",
        springboot: "w-22 bg-chip-springboot-300",
        nodejs: "w-16.5 bg-chip-nodejs-300",
      },
    },
  },
)

type Role =
  | "plan"
  | "design"
  | "web"
  | "ios"
  | "android"
  | "springboot"
  | "nodejs"

const ROLE_LABEL: Record<Role, string> = {
  plan: "PM",
  design: "Design",
  web: "Web",
  ios: "iOS",
  android: "Android",
  springboot: "SpringBoot",
  nodejs: "Node.js",
}

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
