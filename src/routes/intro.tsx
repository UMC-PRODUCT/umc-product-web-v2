import { createFileRoute } from "@tanstack/react-router"

import { IntroPage } from "@/features/intro/ui/IntroPage"

export const Route = createFileRoute("/intro")({
  component: IntroPage,
})
