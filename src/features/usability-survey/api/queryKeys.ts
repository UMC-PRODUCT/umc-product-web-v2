import type { FeedbackContext } from "./types"

export const feedbackKeys = {
  all: ["user-feedbacks"] as const,
  template: (context: FeedbackContext) =>
    [...feedbackKeys.all, "template", context] as const,
}
