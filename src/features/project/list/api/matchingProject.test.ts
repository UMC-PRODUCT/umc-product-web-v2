import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  type ApplicationAnswerItem,
  saveApplicationDraft,
  submitApplication,
} from "./matchingProject"

const { putMock, postMock } = vi.hoisted(() => ({
  putMock: vi.fn(),
  postMock: vi.fn(),
}))

vi.mock("@/shared/lib/axios", () => ({
  api: { put: putMock, post: postMock },
}))

describe("saveApplicationDraft", () => {
  beforeEach(() => {
    putMock.mockReset()
  })

  it("me 경로로 PUT 호출하고 body는 answers", async () => {
    putMock.mockResolvedValue({
      data: { result: { applicationId: "10", status: "DRAFT" } },
    })
    const answers: ApplicationAnswerItem[] = [
      { questionId: 1, textValue: "answer" },
    ]

    const result = await saveApplicationDraft(7, answers)

    expect(putMock).toHaveBeenCalledWith("/v1/projects/7/applications/me", {
      answers,
    })
    expect(result).toEqual({ applicationId: "10", status: "DRAFT" })
  })

  it("applicationId 기반 레거시 경로를 호출하지 않는다", async () => {
    putMock.mockResolvedValue({
      data: { result: { applicationId: "10", status: "DRAFT" } },
    })

    await saveApplicationDraft(7, [])

    const calledUrl = putMock.mock.calls[0]?.[0]
    expect(calledUrl).toMatch(/\/applications\/me$/)
    expect(calledUrl).not.toMatch(/\/applications\/\d+$/)
  })
})

describe("submitApplication", () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  it("me 기반 submit 경로로 POST 호출", async () => {
    postMock.mockResolvedValue({
      data: { result: { applicationId: "10", status: "SUBMITTED" } },
    })

    const result = await submitApplication(7)

    expect(postMock).toHaveBeenCalledWith(
      "/v1/projects/7/applications/me/submit",
    )
    expect(result).toEqual({ applicationId: "10", status: "SUBMITTED" })
  })

  it("applicationId 기반 레거시 경로를 호출하지 않는다", async () => {
    postMock.mockResolvedValue({
      data: { result: { applicationId: "10", status: "SUBMITTED" } },
    })

    await submitApplication(7)

    const calledUrl = postMock.mock.calls[0]?.[0]
    expect(calledUrl).toMatch(/\/applications\/me\/submit$/)
    expect(calledUrl).not.toMatch(/\/applications\/\d+\/submit$/)
  })
})
