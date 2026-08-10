import { describe, expect, it } from "vitest"

import { withImageCacheKey } from "./withImageCacheKey"

const PRESIGNED =
  "https://bucket.s3.ap-northeast-2.amazonaws.com/a.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260806T110434Z&X-Amz-Signature=abc123"

describe("withImageCacheKey", () => {
  it("값이 없으면 null", () => {
    expect(withImageCacheKey(null, 1)).toBeNull()
    expect(withImageCacheKey("", 1)).toBeNull()
  })

  it("일반 URL 에는 캐시키를 붙인다", () => {
    expect(withImageCacheKey("https://cdn.example.com/a.jpg", 7)).toBe(
      "https://cdn.example.com/a.jpg?v=7",
    )
    expect(withImageCacheKey("https://cdn.example.com/a.jpg?w=100", 7)).toBe(
      "https://cdn.example.com/a.jpg?w=100&v=7",
    )
  })

  it("해시는 뒤에 남긴다", () => {
    expect(withImageCacheKey("https://cdn.example.com/a.jpg#frag", 7)).toBe(
      "https://cdn.example.com/a.jpg?v=7#frag",
    )
  })

  // 파라미터를 하나라도 더하면 서명이 깨져 403 이 되고 이미지가 fallback 으로 빠진다
  it("presigned URL 은 그대로 둔다", () => {
    expect(withImageCacheKey(PRESIGNED, 7)).toBe(PRESIGNED)
  })
})
