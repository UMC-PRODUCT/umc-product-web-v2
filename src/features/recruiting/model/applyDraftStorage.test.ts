import { beforeEach, describe, expect, it } from "vitest"

import {
  clearApplyDraft,
  readApplyDraft,
  writeApplyDraft,
} from "./applyDraftStorage"

const DRAFT = { applicationId: "104", applicationKey: "A3F9K2" }

describe("applyDraftStorage", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("쓴 값을 그대로 읽는다", () => {
    writeApplyDraft("7", "member-1", DRAFT)
    expect(readApplyDraft("7", "member-1")).toEqual(DRAFT)
  })

  it("저장한 적 없으면 null 이다", () => {
    expect(readApplyDraft("7", "member-1")).toBeNull()
  })

  it("차수가 다르면 서로 침범하지 않는다", () => {
    writeApplyDraft("7", "member-1", DRAFT)
    expect(readApplyDraft("8", "member-1")).toBeNull()
  })

  it("같은 기기의 다른 계정과 섞이지 않는다", () => {
    writeApplyDraft("7", "member-1", DRAFT)
    expect(readApplyDraft("7", "member-2")).toBeNull()
  })

  it("지우면 다시 읽히지 않는다", () => {
    writeApplyDraft("7", "member-1", DRAFT)
    clearApplyDraft("7", "member-1")
    expect(readApplyDraft("7", "member-1")).toBeNull()
  })

  it("익명 세션 식별자로 게스트 초안을 지운다", () => {
    writeApplyDraft("7", "anonymous-session-1", DRAFT)
    clearApplyDraft("7", "anonymous-session-1")

    expect(readApplyDraft("7", "anonymous-session-1")).toBeNull()
    expect(readApplyDraft("7", "")).toBeNull()
  })

  it("깨진 값은 없는 것으로 본다", () => {
    localStorage.setItem("umc:recruiting:draft:7:member-1", "{ not json")
    expect(readApplyDraft("7", "member-1")).toBeNull()
  })

  it("형태가 어긋난 값은 없는 것으로 본다", () => {
    localStorage.setItem(
      "umc:recruiting:draft:7:member-1",
      JSON.stringify({ applicationId: 104 }),
    )
    expect(readApplyDraft("7", "member-1")).toBeNull()
  })
})
