import { createFileRoute } from "@tanstack/react-router"

import { ChallengerVerification } from "@/features/challenger/ui/ChallengerVerification"

export const Route = createFileRoute("/test/challenger-verification")({
  component: ChallengerVerification,
})
