import { MedalFirst, MedalSecond, MedalThird } from "@/assets/svg"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex h-screen w-full items-center justify-center gap-4">
      <MedalFirst className="h-20 w-20" />
      <MedalSecond className="h-20 w-20" />
      <MedalThird className="h-20 w-20" />
    </div>
  )
}
