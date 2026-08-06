/**
 * presigned URL 은 서명이 쿼리 파라미터 집합에 걸려 있어, 파라미터를 하나라도
 * 더하면 서명이 깨져 403 이 된다.
 *
 * 캐시를 깰 필요도 없다. 서버가 요청마다 새 서명으로 URL 을 발급하므로
 * 같은 이미지라도 주소가 매번 달라진다.
 */
function isPresigned(url: string): boolean {
  return url.includes("X-Amz-Signature=")
}

export function withImageCacheKey(
  src: string | null | undefined,
  cacheKey: number,
): string | null {
  if (!src) return null
  if (isPresigned(src)) return src

  const hashIndex = src.indexOf("#")
  const baseUrl = hashIndex >= 0 ? src.slice(0, hashIndex) : src
  const hash = hashIndex >= 0 ? src.slice(hashIndex + 1) : ""
  const separator = baseUrl.includes("?") ? "&" : "?"
  const versionedUrl = `${baseUrl}${separator}v=${cacheKey}`
  return hash ? `${versionedUrl}#${hash}` : versionedUrl
}
