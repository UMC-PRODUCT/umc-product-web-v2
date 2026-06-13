export function withImageCacheKey(
  src: string | null | undefined,
  cacheKey: number,
): string | null {
  if (!src) return null

  const hashIndex = src.indexOf("#")
  const baseUrl = hashIndex >= 0 ? src.slice(0, hashIndex) : src
  const hash = hashIndex >= 0 ? src.slice(hashIndex + 1) : ""
  const separator = baseUrl.includes("?") ? "&" : "?"
  const versionedUrl = `${baseUrl}${separator}v=${cacheKey}`
  return hash ? `${versionedUrl}#${hash}` : versionedUrl
}
