import { createFileRoute } from "@tanstack/react-router"

import Header from "@/components/header/Header"

export const Route = createFileRoute("/admin")({
  component: AdminPage,
})

function AdminPage() {
  return (
    <main className="h-full min-h-screen w-full">
      <Header />
      <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center">
        <p className="text-heading-5-semibold text-teal-gray-400">준비중</p>
      </div>
    </main>
  )
}
