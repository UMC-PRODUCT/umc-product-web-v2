import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router"

import Header from "@/components/header/Header"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import { isOperator } from "@/features/auth/model/identity"
import { cn } from "@/shared/lib/utils"
import { useViewModeStore } from "@/shared/view-mode"
import { projectViewMe } from "@/shared/view-mode/projectViewMe"

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    const viewMe = projectViewMe(me, useViewModeStore.getState().mode)
    if (!isOperator(viewMe)) throw redirect({ to: "/" })
  },
  component: AdminLayout,
})

interface AdminNavItem {
  label: string
  to: string
}

const ADMIN_NAV: AdminNavItem[] = [
  { label: "챌린저 상벌점", to: "/admin/challenger/points" },
  { label: "챌린저 기록 코드", to: "/admin/challenger/records" },
]

function AdminLayout() {
  const location = useLocation()

  return (
    <main className="h-full min-h-screen w-full">
      <Header />
      <nav className="border-teal-gray-100 border-b bg-white">
        <ul className="mx-auto flex w-full max-w-300 items-center gap-2 px-8.5">
          {ADMIN_NAV.map((item) => {
            const active = location.pathname.startsWith(item.to)
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "text-body-2-medium text-teal-gray-500 inline-flex h-12 items-center border-b-2 border-transparent px-3 transition-colors hover:text-teal-600",
                    active && "border-teal-500 text-teal-600",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="flex w-full">
        <Outlet />
      </div>
    </main>
  )
}
