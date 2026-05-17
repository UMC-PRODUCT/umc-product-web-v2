import type { components } from "@/types/api"

export type CreateDraftProjectRequest =
  components["schemas"]["CreateDraftProjectRequest"]
export type ProjectStatusResponse =
  components["schemas"]["ProjectStatusResponse"]
export type UpdateProjectRequest = components["schemas"]["UpdateProjectRequest"]
export type DraftProjectResponse = components["schemas"]["DraftProjectResponse"]

export type UpsertApplicationFormRequest =
  components["schemas"]["UpsertApplicationFormRequest"]
export type ApplicationFormSection =
  components["schemas"]["ApplicationFormSection"]
export type ApplicationQuestionItem =
  components["schemas"]["ApplicationQuestionItem"]
export type ApplicationQuestionOptionItem =
  components["schemas"]["ApplicationQuestionOptionItem"]
export type GetApplicationFormResponse =
  components["schemas"]["GetApplicationFormResponse"]
export type UpsertApplicationFormResponse =
  components["schemas"]["UpsertApplicationFormResponse"]

export type UpdatePartQuotasRequest =
  components["schemas"]["UpdatePartQuotasRequest"]
export type PartQuotaEntry = UpdatePartQuotasRequest["entries"][number]
export type ApiPart = PartQuotaEntry["part"]

export type PrepareUploadRequest = components["schemas"]["PrepareUploadRequest"]
export type PrepareUploadResponse =
  components["schemas"]["PrepareUploadResponse"]
export type UploadCategory = PrepareUploadRequest["category"]

export type AddProjectMemberRequest =
  components["schemas"]["AddProjectMemberRequest"]
export type TransferProjectOwnershipRequest =
  components["schemas"]["TransferProjectOwnershipRequest"]
