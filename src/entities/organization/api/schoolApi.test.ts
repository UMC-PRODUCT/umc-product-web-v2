import { beforeEach, describe, expect, it, vi } from "vitest"

import { deleteSchool } from "./schoolApi"

const { deleteMock } = vi.hoisted(() => ({
  deleteMock: vi.fn(),
}))

vi.mock("@/shared/lib/axios", () => ({
  api: { delete: deleteMock },
}))

describe("deleteSchool", () => {
  beforeEach(() => {
    deleteMock.mockReset()
  })

  it("유효한 수치형 ID 전달 시 deleteSchools를 호출한다", async () => {
    deleteMock.mockResolvedValue({ data: { result: undefined } })

    await deleteSchool("123")

    expect(deleteMock).toHaveBeenCalledWith("/v1/schools", {
      data: { schoolIds: [123] },
    })
  })

  it("숫자로 변환할 수 없는 유효하지 않은 ID 전달 시 Error를 발생시킨다", async () => {
    await expect(deleteSchool("invalid-id")).rejects.toThrow(
      "유효하지 않은 학교 ID입니다.",
    )
    expect(deleteMock).not.toHaveBeenCalled()
  })
})
