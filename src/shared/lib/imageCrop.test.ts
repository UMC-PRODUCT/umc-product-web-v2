import { describe, expect, it } from "vitest"

import { calculateCenterCrop, calculateCenterCropOutput } from "./imageCrop"

describe("calculateCenterCrop", () => {
  it("가로로 긴 이미지는 좌우를 중앙 크롭한다", () => {
    const crop = calculateCenterCrop(
      { width: 1200, height: 600 },
      { width: 540, height: 540 },
    )

    expect(crop).toEqual({
      sx: 300,
      sy: 0,
      sw: 600,
      sh: 600,
    })
  })

  it("세로로 긴 이미지는 상하를 중앙 크롭한다", () => {
    const crop = calculateCenterCrop(
      { width: 600, height: 1200 },
      { width: 540, height: 286 },
    )

    expect(crop.sx).toBe(0)
    expect(crop.sy).toBeCloseTo(441.111)
    expect(crop.sw).toBe(600)
    expect(crop.sh).toBeCloseTo(317.778)
  })

  it("출력 크기는 고정값이 아니라 실제 크롭 영역을 따른다", () => {
    const { output } = calculateCenterCropOutput(
      { width: 1200, height: 600 },
      { width: 540, height: 540 },
    )

    expect(output).toEqual({
      width: 600,
      height: 600,
    })
  })
})
