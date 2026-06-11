import type {
  ChoiceQuestion,
  ScaleQuestion,
  ScaleWithTextQuestion,
  SingleSelectQuestion,
  SurveyVariantConfig,
  TextQuestion,
} from "./types"

const makeChoice = (
  id: string,
  text: string,
  positiveLabel: string,
  negativeLabel: string,
): ChoiceQuestion => ({
  id,
  kind: "emoji-choice",
  text,
  positiveLabel,
  negativeLabel,
})

const makeFeedbackText = (text: string): TextQuestion => ({
  id: "feedback",
  kind: "text",
  text,
  placeholder: "자유롭게 작성해 주세요 (선택)",
  optional: true,
})

const DIFFICULTY_SCALE: ScaleQuestion = {
  id: "difficulty",
  kind: "emoji-scale",
  text: "사용하기에는 어려웠나요?",
  scores: [5, 4, 3, 2, 1],
  labels: ["쉬움", "", "보통", "", "어려움"],
}

const MATCHING_PROCESS_PREV = makeChoice(
  "matching-process",
  "이번 매칭 과정은 전반적으로 어떠셨나요?",
  "전보다 편해요",
  "전보다 불편해요",
)

const INFO_DIFFICULTY: ScaleWithTextQuestion = {
  id: "info-difficulty",
  kind: "emoji-scale-with-text",
  text: "필요한 정보를 찾는 데 어려움이 있었나요?",
  scores: [5, 3, 1],
  labels: ["전혀 없었어요", "조금 있었어요", "많이 있었어요"],
  textPlaceholder: "자유롭게 작성해 주세요 (선택)",
}

const REUSE_CHOICE = makeChoice(
  "reuse",
  "다음에도 이 방식으로 이용하고 싶으신가요?",
  "좋아요",
  "아니요",
)

const WORST_STEP_SELECT: SingleSelectQuestion = {
  id: "worst-step",
  kind: "single-select",
  text: "가장 불편했던 단계는 어디였나요? (선택)",
  optional: true,
  options: [
    { value: "notice", label: "공지 작성" },
    { value: "project-list", label: "프로젝트 목록 및 정보 확인" },
    { value: "apply-status", label: "지원 현황" },
    { value: "matching-status", label: "매칭 현황" },
    { value: "round-setting", label: "매칭 차수 설정" },
  ],
}

const FEEDBACK_TEXT = makeFeedbackText(
  "가장 불편했던 점 or 좋았던 점은 무엇이었나요? (선택)",
)

const ADMIN_FEEDBACK_TEXT = makeFeedbackText(
  "불편했던 점 or 좋았던 점은 무엇이었나요? (선택)",
)

const EXTRA_TEXT: TextQuestion = {
  id: "extra",
  kind: "text",
  text: "추가로 남기고 싶은 의견이 있나요? (선택)",
  placeholder: "자유롭게 작성해 주세요 (선택)",
  optional: true,
}

const ADMIN_MATCHING_TITLE = "새롭게 바뀐 매칭 경험이 어떠셨나요?"

export type SurveyVariantKey =
  | "prev-gisu-general-apply"
  | "new-gisu-general-apply"
  | "prev-gisu-general-matching"
  | "new-gisu-general-matching"
  | "admin-matching"

export const SURVEY_VARIANTS: Record<SurveyVariantKey, SurveyVariantConfig> = {
  "prev-gisu-general-apply": {
    preventClose: true,
    steps: [
      {
        title: "새롭게 바뀐 지원 경험이 어떠셨나요?",
        items: [
          DIFFICULTY_SCALE,
          makeChoice(
            "apply-process",
            "프로젝트 탐색과 지원 과정은 어떠셨나요?",
            "전보다 편해요",
            "전보다 불편해요",
          ),
          FEEDBACK_TEXT,
          EXTRA_TEXT,
        ],
        footer: "submit-only",
        reveal: "optional-group",
      },
    ],
  },
  "new-gisu-general-apply": {
    preventClose: true,
    steps: [
      {
        title: "프로젝트 지원 경험이 어떠셨나요?",
        items: [
          DIFFICULTY_SCALE,
          makeChoice(
            "apply-process",
            "프로젝트 탐색과 지원 과정은 어떠셨나요?",
            "만족스러워요",
            "아쉬워요",
          ),
          FEEDBACK_TEXT,
          EXTRA_TEXT,
        ],
        footer: "submit-only",
        reveal: "optional-group",
      },
    ],
  },
  "prev-gisu-general-matching": {
    preventClose: true,
    steps: [
      {
        title: "새롭게 바뀐 매칭 경험이 어떠셨나요?",
        items: [
          DIFFICULTY_SCALE,
          MATCHING_PROCESS_PREV,
          REUSE_CHOICE,
          FEEDBACK_TEXT,
          EXTRA_TEXT,
        ],
        footer: "submit-only",
        reveal: "optional-group",
      },
    ],
  },
  "new-gisu-general-matching": {
    preventClose: true,
    steps: [
      {
        title: "전반적인 매칭 경험이 어떠셨나요?",
        items: [
          DIFFICULTY_SCALE,
          makeChoice(
            "matching-process",
            "이번 매칭 과정은 전반적으로 어떠셨나요?",
            "만족스러워요",
            "아쉬워요",
          ),
          REUSE_CHOICE,
          FEEDBACK_TEXT,
          EXTRA_TEXT,
        ],
        footer: "submit-only",
        reveal: "optional-group",
      },
    ],
  },
  "admin-matching": {
    preventClose: true,
    steps: [
      {
        title: ADMIN_MATCHING_TITLE,
        items: [DIFFICULTY_SCALE, MATCHING_PROCESS_PREV, INFO_DIFFICULTY],
        footer: "next-only",
      },
      {
        title: ADMIN_MATCHING_TITLE,
        items: [
          REUSE_CHOICE,
          {
            kind: "divider",
            id: "optional-section",
            label: "선택 사항",
          },
          ADMIN_FEEDBACK_TEXT,
          WORST_STEP_SELECT,
          EXTRA_TEXT,
        ],
        footer: "back-submit",
        reveal: "optional-group",
      },
    ],
  },
}
