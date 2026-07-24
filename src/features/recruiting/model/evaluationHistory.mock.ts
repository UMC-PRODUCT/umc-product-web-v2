import type { EvaluationHistoryEntry } from "./evaluationHistory"

// TODO: 서버 연동 전까지 임시 목업.
export const EVALUATION_HISTORY_MOCK: EvaluationHistoryEntry[] = [
  {
    id: "1",
    processedAt: "2026-07-04T02:10:00",
    applicant: {
      chapter: "Selenium",
      school: "한양대 ERICA",
      name: "박유엠",
      part: "web-pe",
      result: "pass",
    },
    evaluator: {
      id: "evaluator-1",
      chapter: "Selenium",
      school: "한양대 ERICA",
      position: "회장",
      nickname: "이방토",
      name: "이예원",
    },
  },
  {
    id: "2",
    processedAt: "2026-07-04T01:40:00",
    applicant: {
      chapter: "Chromium",
      school: "동덕여대",
      name: "김유엠",
      part: "design",
      result: "fail",
    },
    evaluator: {
      id: "evaluator-2",
      chapter: "Chromium",
      school: "동덕여대",
      position: "부회장",
      nickname: "닉네임",
      name: "이름",
    },
  },
  {
    id: "3",
    processedAt: "2026-07-03T23:05:00",
    applicant: {
      chapter: "Selenium",
      school: "한양대 ERICA",
      name: "박유엠",
      part: "web-pe",
      result: "pass",
    },
    evaluator: {
      id: "evaluator-1",
      chapter: "Selenium",
      school: "한양대 ERICA",
      position: "회장",
      nickname: "이방토",
      name: "이예원",
    },
  },
]

export const EVALUATION_HISTORY_BASE_TIME_MOCK = "26-07-04 02:48"
