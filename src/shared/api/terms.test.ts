import { beforeEach, describe, expect, it, vi } from "vitest"

import { publicApi } from "@/shared/lib/publicApi"

import { getPublicTermByType } from "./terms"

vi.mock("@/shared/lib/publicApi", () => ({
  publicApi: {
    get: vi.fn(),
  },
}))

describe("getPublicTermByType", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("문자열 약관 ID를 숫자로 정규화한다", async () => {
    vi.mocked(publicApi.get).mockResolvedValueOnce({
      data: {
        success: true,
        code: "COMMON200",
        message: "OK",
        result: {
          id: "1",
          link: "https://example.com/privacy",
          isMandatory: true,
        },
      },
    })

    const result = await getPublicTermByType("PRIVACY")

    expect(publicApi.get).toHaveBeenCalledWith("/v1/terms/type/PRIVACY")
    expect(result).toEqual({
      id: 1,
      link: "https://example.com/privacy",
      isMandatory: true,
    })
    expect(typeof result.id).toBe("number")
  })

  it("숫자로 변환할 수 없는 약관 ID는 거부한다", async () => {
    vi.mocked(publicApi.get).mockResolvedValueOnce({
      data: {
        success: true,
        code: "COMMON200",
        message: "OK",
        result: { id: "invalid", link: "", isMandatory: true },
      },
    })

    await expect(getPublicTermByType("PRIVACY")).rejects.toThrow(
      "invalid public term id",
    )
  })

  it("빈 문자열 약관 ID는 거부한다", async () => {
    vi.mocked(publicApi.get).mockResolvedValueOnce({
      data: {
        success: true,
        code: "COMMON200",
        message: "OK",
        result: { id: "", link: "", isMandatory: true },
      },
    })

    await expect(getPublicTermByType("PRIVACY")).rejects.toThrow(
      "invalid public term id",
    )
  })

  it("안전 정수 범위를 벗어난 약관 ID는 거부한다", async () => {
    vi.mocked(publicApi.get).mockResolvedValueOnce({
      data: {
        success: true,
        code: "COMMON200",
        message: "OK",
        result: {
          id: "9007199254740993",
          link: "",
          isMandatory: true,
        },
      },
    })

    await expect(getPublicTermByType("PRIVACY")).rejects.toThrow(
      "invalid public term id",
    )
  })
})
