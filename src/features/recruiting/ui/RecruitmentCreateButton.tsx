import { Button } from "@/shared/ui/Button"

interface RecruitmentCreateButtonProps {
  onClick?: () => void
  className?: string
}

export function RecruitmentCreateButton({
  onClick,
  className,
}: RecruitmentCreateButtonProps) {
  return (
    <Button
      variant="fill"
      color="primary"
      size="s"
      icon
      onClick={onClick}
      className={className}
    >
      모집 공고
    </Button>
  )
}
