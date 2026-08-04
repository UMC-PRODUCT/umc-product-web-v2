import { describe, expect, it } from "vitest"

import {
  buildRecruitingAnswersSchema,
  hasPendingUpload,
  resolveEnabledSectionIds,
  toDirtySnapshot,
} from "./applyForm"

import type {
  ApplicationQuestion,
  ApplicationSection,
} from "./applicationDetail"
import type { ApplyFormConfig } from "./applyForm"

function section(
  sectionId: string,
  type: ApplicationSection["type"],
): ApplicationSection {
  return { sectionId, type, title: sectionId, questions: [] }
}

const SECTIONS = [
  section("common-1", "common"),
  section("part-pm", "part"),
  section("part-design", "part"),
]

function config(partial: Partial<ApplyFormConfig> = {}): ApplyFormConfig {
  return {
    recruitment: {
      recruitmentId: "1",
      title: "모집",
      school: "학교",
      notice: "",
      logoUrl: null,
    },
    sections: SECTIONS,
    partQuestionIds: [],
    partOptionSectionMap: {},
    ...partial,
  }
}

describe("resolveEnabledSectionIds", () => {
  it("파트 문항 설정이 없으면 받은 섹션을 모두 연다", () => {
    expect([...resolveEnabledSectionIds(config(), {})]).toEqual([
      "common-1",
      "part-pm",
      "part-design",
    ])
  })

  it("파트 문항 설정이 있으면 고른 파트 섹션만 연다", () => {
    const withParts = config({
      partQuestionIds: ["q-part"],
      partOptionSectionMap: {
        "opt-pm": "part-pm",
        "opt-design": "part-design",
      },
    })
    const enabled = resolveEnabledSectionIds(withParts, { "q-part": "opt-pm" })
    expect([...enabled]).toEqual(["common-1", "part-pm"])
  })

  it("파트를 고르기 전에는 공통 섹션만 연다", () => {
    const withParts = config({
      partQuestionIds: ["q-part"],
      partOptionSectionMap: { "opt-pm": "part-pm" },
    })
    expect([...resolveEnabledSectionIds(withParts, {})]).toEqual(["common-1"])
  })
})

function question(
  partial: Partial<ApplicationQuestion> &
    Pick<ApplicationQuestion, "questionId" | "type">,
): ApplicationQuestion {
  return {
    title: "문항",
    required: true,
    options: [],
    textValue: null,
    selectedOptionIds: [],
    files: [],
    ...partial,
  }
}

function schemaFor(questions: ApplicationQuestion[]) {
  const sections = [
    { sectionId: "s1", type: "common" as const, title: "s", questions },
  ]
  return buildRecruitingAnswersSchema(sections, new Set(["s1"]))
}

describe("buildRecruitingAnswersSchema", () => {
  it("필수 텍스트에 공백만 넣으면 통과시키지 않는다", () => {
    const schema = schemaFor([question({ questionId: "1", type: "shortText" })])
    expect(schema.safeParse({ "1": "   " }).success).toBe(false)
    expect(schema.safeParse({ "1": "답변" }).success).toBe(true)
  })

  it("필수 긴 글도 공백만이면 막는다", () => {
    const schema = schemaFor([question({ questionId: "1", type: "longText" })])
    expect(schema.safeParse({ "1": " \n " }).success).toBe(false)
  })

  it("업로드 중인 필수 파일은 첨부 없음이 아니라 대기로 안내한다", () => {
    const schema = schemaFor([question({ questionId: "1", type: "file" })])
    const result = schema.safeParse({
      "1": { name: "a.pdf", uploading: true },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "업로드가 끝난 뒤 제출할 수 있습니다.",
      )
    }
  })

  it("파일을 고르지 않았으면 첨부하라고 안내한다", () => {
    const schema = schemaFor([question({ questionId: "1", type: "file" })])
    const result = schema.safeParse({ "1": null })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("파일을 첨부해 주세요.")
    }
  })

  it("업로드가 끝난 파일은 통과한다", () => {
    const schema = schemaFor([question({ questionId: "1", type: "file" })])
    expect(
      schema.safeParse({ "1": { name: "a.pdf", fileId: "f-1" } }).success,
    ).toBe(true)
  })

  it("선택 파일 문항은 업로드 중이어도 오류를 내지 않는다", () => {
    const schema = schemaFor([
      question({ questionId: "1", type: "file", required: false }),
    ])
    expect(
      schema.safeParse({ "1": { name: "a.pdf", uploading: true } }).success,
    ).toBe(true)
    expect(schema.safeParse({ "1": null }).success).toBe(true)
  })

  it("선택 포트폴리오도 업로드 중이면 통과시킨다", () => {
    const schema = schemaFor([
      question({ questionId: "1", type: "portfolio", required: false }),
    ])
    expect(
      schema.safeParse({
        "1": { kind: "file", name: "p.pdf", uploading: true },
      }).success,
    ).toBe(true)
  })

  it("선택 포트폴리오의 잘못된 링크는 막는다", () => {
    const schema = schemaFor([
      question({ questionId: "1", type: "portfolio", required: false }),
    ])
    expect(
      schema.safeParse({ "1": { kind: "link", url: "not-a-url" } }).success,
    ).toBe(false)
  })
})

const UPLOAD_SECTIONS = [
  {
    sectionId: "s1",
    type: "common" as const,
    title: "s",
    questions: [
      question({ questionId: "a", type: "file" }),
      question({ questionId: "b", type: "portfolio" }),
    ],
  },
]

describe("hasPendingUpload", () => {
  it("진행 중인 업로드가 있으면 참이다", () => {
    expect(
      hasPendingUpload(
        { a: { name: "a.pdf", uploading: true } },
        UPLOAD_SECTIONS,
      ),
    ).toBe(true)
    expect(
      hasPendingUpload(
        { b: { kind: "file", name: "b.pdf", uploading: true } },
        UPLOAD_SECTIONS,
      ),
    ).toBe(true)
  })

  it("끝났거나 없는 값은 거짓이다", () => {
    expect(
      hasPendingUpload(
        { a: { name: "a.pdf", fileId: "f-1" }, b: null },
        UPLOAD_SECTIONS,
      ),
    ).toBe(false)
  })

  it("지금 구조에 없는 문항의 업로드는 세지 않는다", () => {
    expect(
      hasPendingUpload(
        { removed: { name: "old.pdf", uploading: true } },
        UPLOAD_SECTIONS,
      ),
    ).toBe(false)
  })
})

describe("toDirtySnapshot", () => {
  it("빈 값만 늘어난 것은 변경으로 보지 않는다", () => {
    const before = toDirtySnapshot({ q1: "답변" })
    const after = toDirtySnapshot({ q1: "답변", q2: "", q3: [], q4: null })
    expect(after).toBe(before)
  })

  it("공백만 채운 것도 변경이 아니다", () => {
    expect(toDirtySnapshot({ q1: "   " })).toBe(toDirtySnapshot({}))
  })

  it("실제로 채운 답변은 변경으로 본다", () => {
    expect(toDirtySnapshot({ q1: "답변" })).not.toBe(toDirtySnapshot({}))
  })

  it("키 순서가 달라도 같게 본다", () => {
    expect(toDirtySnapshot({ a: "1", b: "2" })).toBe(
      toDirtySnapshot({ b: "2", a: "1" }),
    )
  })
})
