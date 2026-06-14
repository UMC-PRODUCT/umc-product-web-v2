import type { components } from "@/types/api"

export type FeedbackContext =
  components["schemas"]["GetUserFeedbackTemplateResponse"]["context"]

export type FeedbackTargetType =
  components["schemas"]["GetUserFeedbackTemplateResponse"]["targetType"]

export type GetUserFeedbackTemplateResponse =
  components["schemas"]["GetUserFeedbackTemplateResponse"]

export type FeedbackForm = components["schemas"]["FeedbackForm"]
export type FeedbackSection = components["schemas"]["FeedbackSection"]
export type FeedbackQuestion = components["schemas"]["FeedbackQuestion"]
export type FeedbackOption = components["schemas"]["FeedbackOption"]
export type FeedbackQuestionType = NonNullable<FeedbackQuestion["type"]>

export type SubmitUserFeedbackResponseRequest =
  components["schemas"]["SubmitUserFeedbackResponseRequest"]
export type UserFeedbackAnswerItem =
  components["schemas"]["UserFeedbackAnswerItem"]
export type UserFeedbackSubmitResponse =
  components["schemas"]["UserFeedbackSubmitResponse"]
