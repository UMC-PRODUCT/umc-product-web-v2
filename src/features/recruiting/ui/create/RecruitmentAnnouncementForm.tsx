import { Button } from "@/shared/ui/Button"

interface RecruitmentAnnouncementFormProps {
  onPrev: () => void
}

// TODO: 모집 공고 등록 UI 구현
export function RecruitmentAnnouncementForm({
  onPrev,
}: RecruitmentAnnouncementFormProps) {
  return (
    <div className="border-teal-gray-150 mt-6 flex flex-col gap-6 rounded-2xl border bg-white px-8 py-8.5">
      <p className="text-body-2-regular text-teal-gray-400 py-20 text-center">
        모집 공고 화면은 준비 중입니다.
      </p>
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="weak" color="neutral" onClick={onPrev}>
          이전
        </Button>
        <Button type="button" variant="fill" color="primary" disabled>
          {/* TODO: 실제 등록 API 연동 */}
          등록하기
        </Button>
      </div>
    </div>
  )
}
