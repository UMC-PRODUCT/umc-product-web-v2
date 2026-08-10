import { memberBriefToItem } from "../api/memberAdapter"

import type { ApiPart, ProjectDetailResponse } from "../api/types"
import type {
  ProjectRegisterStoreApi,
  RoleKey,
  RoleStack,
  RoleState,
} from "./useProjectRegisterStore"

type PartMapping = { role: RoleKey; stack?: RoleStack } | null

const PART_TO_ROLE: Record<ApiPart, PartMapping> = {
  DESIGN: { role: "design" },
  WEB: { role: "frontend", stack: "Web" },
  IOS: { role: "frontend", stack: "iOS" },
  ANDROID: { role: "frontend", stack: "Android" },
  SPRINGBOOT: { role: "backend", stack: "SpringBoot" },
  NODEJS: { role: "backend", stack: "Node.js" },
  PLAN: null,
  ADMIN: null,
}

export function hydrateProjectDetailIntoStore(
  detail: ProjectDetailResponse,
  storeApi: ProjectRegisterStoreApi,
): void {
  const store = storeApi.getState()

  if (detail.id) store.setProjectId(detail.id)

  const pm1 = detail.productOwner
    ? memberBriefToItem(detail.productOwner)
    : null
  const coOwners = detail.coProductOwners ?? []
  const pm2 =
    coOwners.length > 0 && coOwners[0] ? memberBriefToItem(coOwners[0]) : null

  store.setPmInfo({ isMultiPm: pm2 !== null, pm1, pm2 })

  store.setBasicDraftFields({
    title: detail.name ?? "",
    description: detail.description ?? "",
    externalLink: detail.externalLink ?? "",
  })

  store.setUploaded({
    thumbnailUrl: detail.thumbnailImageUrl ?? null,
    logoUrl: detail.logoImageUrl ?? null,
  })

  const recruitInfo = {
    design: { count: 0, stack: undefined },
    frontend: { count: 0, stack: undefined },
    backend: { count: 0, stack: undefined },
  } as Record<RoleKey, RoleState>

  for (const quota of detail.partQuotas ?? []) {
    if (!quota.part) continue
    const mapping = PART_TO_ROLE[quota.part as ApiPart]
    if (!mapping) continue
    recruitInfo[mapping.role] = {
      count: Number(quota.quota ?? 0),
      stack: mapping.stack,
    }
  }

  store.setRecruitInfo(recruitInfo)
}
