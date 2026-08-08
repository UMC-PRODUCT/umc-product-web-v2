import { beforeEach, describe, expect, it, vi } from "vitest"

import { api } from "@/shared/lib/axios"

import { getPublicTermByType } from "./terms"

vi.mock("@/shared/lib/axios", () => ({
  api: {
    get: vi.fn(),
  },
}))

describe("getPublicTermByType", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("문자열 약관 ID를 숫자로 정규화한다", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
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

    expect(api.get).toHaveBeenCalledWith("/v1/terms/type/PRIVACY")
    expect(result).toEqual({
      id: 1,
      link: "https://example.com/privacy",
      isMandatory: true,
    })
    expect(typeof result.id).toBe("number")
  })

  it("숫자로 변환할 수 없는 약관 ID는 거부한다", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
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
})
