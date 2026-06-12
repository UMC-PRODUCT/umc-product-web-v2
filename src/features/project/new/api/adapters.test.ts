import { describe, expect, it } from "vitest"

import {
  buildPartQuotasEntries,
  buildUpsertApplicationFormBody,
  uiRoleToPart,
} from "./adapters"

describe("uiRoleToPart", () => {
  it("design은 스택 없이 DESIGN 반환", () => {
    expect(uiRoleToPart("design", undefined)).toBe("DESIGN")
  })

  it("frontend + Web → WEB", () => {
    expect(uiRoleToPart("frontend", "Web")).toBe("WEB")
  })

  it("frontend + iOS → IOS", () => {
    expect(uiRoleToPart("frontend", "iOS")).toBe("IOS")
  })

  it("frontend + Android → ANDROID", () => {
    expect(uiRoleToPart("frontend", "Android")).toBe("ANDROID")
  })

  it("backend + SpringBoot → SPRINGBOOT", () => {
    expect(uiRoleToPart("backend", "SpringBoot")).toBe("SPRINGBOOT")
  })

  it("backend + Node.js → NODEJS", () => {
    expect(uiRoleToPart("backend", "Node.js")).toBe("NODEJS")
  })

  it("frontend에 스택 없으면 throw", () => {
    expect(() => uiRoleToPart("frontend", undefined)).toThrow()
  })

  it("backend에 스택 없으면 throw", () => {
    expect(() => uiRoleToPart("backend", undefined)).toThrow()
  })
})

describe("buildPartQuotasEntries", () => {
  it("count > 0인 항목만 포함", () => {
    const result = buildPartQuotasEntries({
      design: { count: 2, stack: undefined },
      frontend: { count: 0, stack: "Web" },
      backend: { count: 0, stack: undefined },
    })
    expect(result).toEqual([{ part: "DESIGN", quota: 2 }])
  })

  it("복수 항목 변환", () => {
    const result = buildPartQuotasEntries({
      design: { count: 1, stack: undefined },
      frontend: { count: 3, stack: "Web" },
      backend: { count: 2, stack: "SpringBoot" },
    })
    expect(result).toHaveLength(3)
    expect(result).toContainEqual({ part: "DESIGN", quota: 1 })
    expect(result).toContainEqual({ part: "WEB", quota: 3 })
    expect(result).toContainEqual({ part: "SPRINGBOOT", quota: 2 })
  })

  it("모두 0이면 빈 배열", () => {
    const result = buildPartQuotasEntries({
      design: { count: 0, stack: undefined },
      frontend: { count: 0, stack: undefined },
      backend: { count: 0, stack: undefined },
    })
    expect(result).toEqual([])
  })
})

describe("buildUpsertApplicationFormBody", () => {
  const commonQ = {
    id: "q-1",
    title: "지원 동기",
    caption: "",
    fieldType: "text" as const,
    required: true,
    options: [],
  }

  const section = {
    id: "frontend",
    name: "Frontend",
    isEnabled: true,
    questions: [
      {
        id: "q-2",
        title: "기술 스택",
        caption: "상세히",
        fieldType: "text" as const,
        required: false,
        options: [],
      },
    ],
  }

  const disabledSection = {
    id: "backend",
    name: "Backend",
    isEnabled: false,
    questions: [],
  }

  it("COMMON 섹션이 첫 번째로 포함됨", () => {
    const result = buildUpsertApplicationFormBody([commonQ], [section])
    expect(result.sections[0]!.type).toBe("COMMON")
  })

  it("비활성 섹션은 제외", () => {
    const result = buildUpsertApplicationFormBody(
      [commonQ],
      [section, disabledSection],
    )
    const types = result.sections.map((s) => s.type)
    expect(types.filter((t) => t === "PART")).toHaveLength(1)
  })

  it("PART 섹션에 allowedParts 매핑", () => {
    const result = buildUpsertApplicationFormBody([commonQ], [section])
    const partSection = result.sections.find((s) => s.type === "PART")
    expect(partSection?.allowedParts).toEqual(["WEB", "IOS", "ANDROID"])
  })

  it("fieldType text → LONG_TEXT 매핑", () => {
    const result = buildUpsertApplicationFormBody([commonQ], [])
    const q = result.sections[0]!.questions[0]!
    expect(q.type).toBe("LONG_TEXT")
  })

  it("radio fieldType 매핑", () => {
    const radioQ = {
      ...commonQ,
      id: "q-r",
      fieldType: "radio" as const,
      options: [{ content: "A" }, { content: "B" }],
    }
    const result = buildUpsertApplicationFormBody([radioQ], [])
    expect(result.sections[0]!.questions[0]!.type).toBe("RADIO")
  })

  it("caption이 없으면 description undefined", () => {
    const result = buildUpsertApplicationFormBody([commonQ], [])
    expect(result.sections[0]!.questions[0]!.description).toBeUndefined()
  })

  it("orderNo가 인덱스 순서대로 설정됨", () => {
    const q2 = { ...commonQ, id: "q-2", title: "두 번째" }
    const result = buildUpsertApplicationFormBody([commonQ, q2], [])
    const qs = result.sections[0]!.questions
    expect(qs[0]!.orderNo).toBe(0)
    expect(qs[1]!.orderNo).toBe(1)
  })

  it("기존 질문 수정 시 questionId를 payload에 포함", () => {
    const editedQ = {
      id: "q-1",
      questionId: 42,
      title: "수정된 질문",
      caption: "",
      fieldType: "text" as const,
      required: true,
      options: [],
    }
    const result = buildUpsertApplicationFormBody([editedQ], [])
    expect(result.sections[0]!.questions[0]!.questionId).toBe(42)
  })

  it("신규 질문은 questionId 없이 전송 (생략)", () => {
    const result = buildUpsertApplicationFormBody([commonQ], [])
    expect(result.sections[0]!.questions[0]!.questionId).toBeUndefined()
  })

  it("옵션의 optionId를 보존하여 전송하고, 없는 옵션은 생략", () => {
    const radioQ = {
      id: "q-r",
      questionId: 7,
      title: "단일 선택",
      caption: "",
      fieldType: "radio" as const,
      required: false,
      options: [{ content: "A", optionId: 100 }, { content: "B" }],
    }
    const result = buildUpsertApplicationFormBody([radioQ], [])
    const opts = result.sections[0]!.questions[0]!.options
    expect(opts[0]).toMatchObject({ content: "A", orderNo: 0, optionId: 100 })
    expect(opts[1]).toMatchObject({ content: "B", orderNo: 1 })
    expect(opts[1]!.optionId).toBeUndefined()
  })
})
