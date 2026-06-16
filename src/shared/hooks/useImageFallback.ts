import { useState } from "react"

import { trackEvent } from "@/shared/analytics"

export function useImageFallback(
  src: string | null | undefined,
  imageType: string,
) {
  const [erroredSrc, setErroredSrc] = useState<string | null>(null)
  const showFallback = !src || erroredSrc === src

  const handleError = () => {
    trackEvent("image_load_error", { image_type: imageType })
    setErroredSrc(src ?? null)
  }

  return { showFallback, handleError }
}
