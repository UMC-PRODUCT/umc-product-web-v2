import { memberBriefToItem } from "../api/memberAdapter"
import { useProjectRegisterStore } from "./useProjectRegisterStore"

import type { DraftProjectResponse } from "../api/types"

export function hydrateDraftIntoStore(draft: DraftProjectResponse): void {
  const store = useProjectRegisterStore.getState()

  if (draft.id) store.setProjectId(draft.id)

  const pm1 = draft.productOwner ? memberBriefToItem(draft.productOwner) : null

  const coOwners = draft.coProductOwners ?? []
  const pm2 =
    coOwners.length > 0 && coOwners[0] ? memberBriefToItem(coOwners[0]) : null

  store.setPmInfo({
    isMultiPm: pm2 !== null,
    pm1,
    pm2,
  })

  store.setBasicDraftFields({
    title: draft.name ?? "",
    description: draft.description ?? "",
    planningLink: draft.externalLink ?? "",
  })

  store.setUploaded({
    thumbnailUrl: draft.thumbnailImageUrl ?? null,
    logoUrl: draft.logoImageUrl ?? null,
  })
}
