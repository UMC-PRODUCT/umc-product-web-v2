import { createFileRoute } from "@tanstack/react-router"

import { AccountSettingsPage } from "@/features/settings/ui/AccountSettingsPage"

export const Route = createFileRoute("/settings/")({
  component: AccountSettingsPage,
})
