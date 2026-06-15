import {
  canAccessProjectSettings,
  canManageMatchingRounds,
  canManageProjectRecruitInfo,
  canManageProjects,
} from "./identity"

import type { MemberInfoResponse } from "@/features/auth/api/me"

export interface ProjectCapabilities {
  canAccessProjectSettings: boolean
  canWriteProject: boolean
  canAccessProjectManagement: boolean
  canManageMatchingRounds: boolean
  canManageProjectRecruitInfo: boolean
  canReadProjectNotice: boolean
  canWriteProjectNotice: boolean
}

export interface ProjectCapabilityState {
  capabilities: ProjectCapabilities
  isPermissionLoading: boolean
}

const EMPTY_PROJECT_CAPABILITIES: ProjectCapabilities = {
  canAccessProjectSettings: false,
  canWriteProject: false,
  canAccessProjectManagement: false,
  canManageMatchingRounds: false,
  canManageProjectRecruitInfo: false,
  canReadProjectNotice: false,
  canWriteProjectNotice: false,
}

export function buildProjectCapabilities({
  me,
  hasProjectWritePermission,
}: {
  me: MemberInfoResponse | undefined
  hasProjectWritePermission: boolean
}): ProjectCapabilities {
  if (!me) return EMPTY_PROJECT_CAPABILITIES

  const canAccessManagement = canManageProjects(me)
  const canAccessSettings =
    canAccessProjectSettings(me) || hasProjectWritePermission
  const canManageRounds = canManageMatchingRounds(me)
  const canManageRecruitInfo = canManageProjectRecruitInfo(me)

  return {
    canAccessProjectSettings: canAccessSettings,
    canWriteProject: hasProjectWritePermission,
    canAccessProjectManagement: canAccessManagement,
    canManageMatchingRounds: canManageRounds,
    canManageProjectRecruitInfo: canManageRecruitInfo,
    canReadProjectNotice: canAccessSettings,
    canWriteProjectNotice: canAccessManagement,
  }
}
