import { AnimatePresence, motion } from "motion/react"

import { SideBarMenuTitle } from "./SideBarMenuTitle"

import type { ComponentType, SVGProps } from "react"

interface SideBarMenuProps {
  id: string
  title: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  isActive: boolean
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

const menuVariants = {
  open: { transition: { staggerChildren: 0.03 } },
  closed: {},
}

export function SideBarMenu({
  id,
  title,
  icon,
  isActive,
  isOpen,
  onToggle,
  children,
}: SideBarMenuProps) {
  return (
    <div className="flex w-42 flex-col">
      <SideBarMenuTitle
        id={id}
        title={title}
        icon={icon}
        isActive={isActive}
        isOpen={isOpen}
        onToggle={onToggle}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`sidebar-menu-${id}`}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="flex flex-col gap-1 py-0.5"
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
