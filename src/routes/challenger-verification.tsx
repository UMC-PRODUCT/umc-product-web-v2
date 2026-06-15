import { createFileRoute } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import { ChallengerVerification } from "@/features/challenger/ui/ChallengerVerification"

export const Route = createFileRoute("/challenger-verification")({
  beforeLoad: async ({ context, location }) => {
    await ensureMe(context.queryClient, location.href)
  },
  component: ChallengerVerification,
})
