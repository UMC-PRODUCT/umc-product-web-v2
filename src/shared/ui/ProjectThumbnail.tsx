import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { useImageFallback } from "@/shared/hooks/useImageFallback"
import { cn } from "@/shared/lib/utils"

interface ProjectThumbnailProps {
  src?: string | null
  alt?: string
  className?: string
}

export function ProjectThumbnail({
  src,
  alt,
  className,
}: ProjectThumbnailProps) {
  const { showFallback, handleError } = useImageFallback(
    src,
    "project_thumbnail",
  )

  if (showFallback) {
    return (
      <div className="flex h-full w-full items-center justify-center py-1.5">
        <UmcLogo className="text-teal-gray-300 aspect-[37/11] w-[23.2%]" />
      </div>
    )
  }

  return (
    <img
      src={src ?? undefined}
      alt={alt ?? ""}
      onError={handleError}
      className={cn("h-full w-full object-cover", className)}
      loading="lazy"
      decoding="async"
    />
  )
}
