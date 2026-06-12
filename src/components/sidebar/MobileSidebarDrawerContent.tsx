import { Link } from "@tanstack/react-router"

import { resolveNavigationFromPathname } from "@/shared/config/navigationResolve"
import { cn } from "@/shared/lib/utils"

import { SideBarViewSwitcher } from "./SideBarViewSwitcher"
import { useVisibleSidebarSections } from "./useVisibleSidebarSections"

interface MobileSidebarDrawerContentProps {
  activePathname: string
  onNavigate?: () => void
}

export function MobileSidebarDrawerContent({
  activePathname,
  onNavigate,
}: MobileSidebarDrawerContentProps) {
  const { visibleSections, isLoading } = useVisibleSidebarSections()
  const resolved = resolveNavigationFromPathname(
    activePathname,
    visibleSections,
  )

  if (isLoading || visibleSections.length === 0) return null

  return (
    <section className="border-teal-gray-100 flex flex-col gap-3 border-t pt-4">
      <SideBarViewSwitcher className="px-0 pt-0" onSelect={onNavigate} />
      <span className="text-caption-2-medium text-teal-gray-400 px-1">
        Demo Day
      </span>

      <div className="flex flex-col gap-4">
        {visibleSections.map(({ id, title, icon: Icon, menus }) => (
          <div key={id} className="flex flex-col gap-1.5">
            <div className="flex h-8 items-center gap-2 px-1">
              <Icon className="text-teal-gray-500 size-4" />
              <span className="text-body-2-medium text-teal-gray-600">
                {title}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1">
              {menus.map((menu) => {
                const isSelected = resolved?.menu.id === menu.id
                return (
                  <Link
                    key={menu.id}
                    to={menu.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex h-10 min-w-0 items-center justify-center rounded-[10px] px-4 whitespace-nowrap transition-colors",
                      isSelected
                        ? "text-subtitle-4-semibold bg-teal-50 text-teal-700"
                        : "text-body-2-medium text-teal-gray-600 hover:bg-teal-gray-50",
                    )}
                  >
                    {menu.title}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
