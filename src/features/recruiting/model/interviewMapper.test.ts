import { describe, expect, it } from "vitest"

import { toInterviewContent } from "./interviewMapper"

import type { RecruitingInterviewQuestion } from "../api/types"

function question(
  id: string,
  content: string,
  orderNo: number,
): RecruitingInterviewQuestion {
  return {
    id,
    roundId: "3",
    applicationId: null,
    content,
    orderNo,
    active: true,
  }
}

describe("toInterviewContent", () => {
  it("공통 질문과 개별 질문을 각각 블록으로 만든다", () => {
    const content = toInterviewContent(
      [question("1", "자기소개를 해주세요", 1)],
      [question("2", "포트폴리오를 설명해주세요", 1)],
    )

    expect(content?.blocks.map((block) => block.title)).toEqual([
      "공통 질문",
      "개별 질문",
    ])
    expect(content?.blocks[0]?.group).toBe("common")
    expect(content?.blocks[1]?.group).toBe("individual")
  })

  it("질문을 orderNo 순으로 정렬한다", () => {
    const content = toInterviewContent(
      [question("2", "두 번째", 2), question("1", "첫 번째", 1)],
      [],
    )

    expect(content?.blocks[0]?.questions.map((q) => q.text)).toEqual([
      "첫 번째",
      "두 번째",
    ])
  })

  it("비어 있는 쪽은 블록을 만들지 않는다", () => {
    const content = toInterviewContent([question("1", "공통", 1)], [])
    expect(content?.blocks).toHaveLength(1)
  })

  it("질문이 하나도 없으면 렌더할 것이 없다", () => {
    expect(toInterviewContent([], [])).toBeNull()
  })

  it("비활성 질문은 렌더 대상에서 뺀다", () => {
    const content = toInterviewContent(
      [
        { ...question("1", "지워진 질문", 1), active: false },
        question("2", "살아 있는 질문", 2),
      ],
      [],
    )

    expect(content?.blocks[0]?.questions.map((q) => q.text)).toEqual([
      "살아 있는 질문",
    ])
  })

  it("전부 비활성이면 블록을 만들지 않는다", () => {
    const content = toInterviewContent(
      [{ ...question("1", "지워진 질문", 1), active: false }],
      [],
    )

    expect(content).toBeNull()
  })

  it("내용이 같은 질문도 서로 다른 식별자를 갖는다", () => {
    const content = toInterviewContent(
      [question("1", "같은 질문", 1), question("2", "같은 질문", 2)],
      [],
    )

    const ids = content?.blocks[0]?.questions.map((q) => q.id)
    expect(ids).toEqual(["1", "2"])
    expect(new Set(ids).size).toBe(2)
  })

  it("답변 저장 경로가 없어 답변은 비워 둔다", () => {
    const content = toInterviewContent([question("1", "공통", 1)], [])
    expect(content?.blocks[0]?.answers).toEqual([])
  })
})
