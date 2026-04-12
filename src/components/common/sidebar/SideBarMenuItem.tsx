import { Link, useMatchRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface SideBarMenuItemProps {
  title: string
  to: string
  indicator?: React.ReactNode
}

const itemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -4 },
}

export function SideBarMenuItem({
  title,
  to,
  indicator,
}: SideBarMenuItemProps) {
  const matchRoute = useMatchRoute()
  const isActive = !!matchRoute({ to })

  return (
    <motion.div variants={itemVariants} transition={{ duration: 0.15 }}>
      <Link
        to={to}
        className={cn(
          "flex h-9 w-full items-center gap-2.75 rounded-[12px] px-3",
          isActive
            ? "text-subtitle-4 text-teal-700"
            : "text-body-2-medium text-teal-gray-600 hover:bg-gray-50",
        )}
      >
        {indicator ?? <span>-</span>}
        <span>{title}</span>
      </Link>
    </motion.div>
  )
}
