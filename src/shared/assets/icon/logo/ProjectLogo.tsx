/** 프로젝트 상세 카드 중 프로젝트 로고 이미지 */
/** 피그마 기준 40 Logo Frame */

type ProjectLogoSize = 30 | 32 | 40 | 50

const sizeClass: Record<ProjectLogoSize, string> = {
  30: "h-[1.875rem] w-[1.875rem]",
  32: "h-8 w-8",
  40: "h-10 w-10",
  50: "h-[3.125rem] w-[3.125rem]",
}

export function ProjectLogo({
  src,
  size = 40,
}: {
  src?: string
  size?: ProjectLogoSize
}) {
  return (
    <div
      className={`bg-teal-gray-200 overflow-hidden rounded-lg ${sizeClass[size]}`}
    >
      {src && (
        <img
          src={src}
          alt="project logo"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
}
