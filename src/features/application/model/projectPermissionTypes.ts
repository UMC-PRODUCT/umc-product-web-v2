export interface CapabilityInfo {
  allowed: boolean
  reasonCode: string | null
  reason: string | null
}

export interface ProjectApplicationCapability {
  canCreate: CapabilityInfo
  canReadList: CapabilityInfo
  canDecide: CapabilityInfo
}

export interface ProjectStatisticsCapability {
  canRead: CapabilityInfo
}

export interface ProjectApplicationFormCapability {
  canRead: CapabilityInfo
  canCreate: CapabilityInfo
  canEdit: CapabilityInfo
  canPublish: CapabilityInfo
  canDelete: CapabilityInfo
}

export interface ProjectStatusCapability {
  canRequestReview: CapabilityInfo
  canPublish: CapabilityInfo
  canComplete: CapabilityInfo
  canAbort: CapabilityInfo
}

export interface ProjectMemberCapability {
  canRead: CapabilityInfo
  canCreate: CapabilityInfo
  canDelete: CapabilityInfo
}

export interface ProjectPermissionResponse {
  projectId: string
  exists: boolean
  canEditInfo: CapabilityInfo
  canTransferOwnership: CapabilityInfo
  canDelete: CapabilityInfo
  applicationForm: ProjectApplicationFormCapability
  partQuota: { canEdit: CapabilityInfo }
  status: ProjectStatusCapability
  application: ProjectApplicationCapability
  member: ProjectMemberCapability
  statistics: ProjectStatisticsCapability
}

export interface ProjectPermissionsResult {
  projects: ProjectPermissionResponse[]
}
