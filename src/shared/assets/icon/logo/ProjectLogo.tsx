/** 프로젝트 상세 카드 중 프로젝트 로고 이미지 */
/** 피그마 기준 40 Logo Frame */

export function ProjectLogo({ src }: { src?: string }) {
  return (
    <div className="bg-teal-gray-200 h-10 w-10 overflow-hidden rounded-lg">
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
