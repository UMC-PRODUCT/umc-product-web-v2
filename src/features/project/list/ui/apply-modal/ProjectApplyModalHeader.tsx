import { ProjectLogo } from "@/shared/assets/icon/logo/ProjectLogo"

interface ProjectApplyModalHeaderProps {
  title: string
  authorSchoolLine: string
}

export function ProjectApplyModalHeader({
  title,
  authorSchoolLine,
}: ProjectApplyModalHeaderProps) {
  return (
    <div className="relative flex h-fit items-center overflow-hidden bg-white px-5.5 py-4">
      <div className="relative z-10 flex flex-col items-start gap-2.5 py-4">
        <div className="flex items-center gap-2">
          <ProjectLogo />
          <h2 className="text-heading-6-semibold text-teal-gray-900">
            {title}
          </h2>
        </div>
        <span className="text-body-2-regular text-teal-gray-500">
          {authorSchoolLine}
        </span>
      </div>
    </div>
  )
}
