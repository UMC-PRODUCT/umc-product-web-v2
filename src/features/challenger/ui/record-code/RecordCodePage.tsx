import { CreateRecordForm } from "@/features/challenger/ui/record-code/CreateRecordForm"
import { LookupRecordForm } from "@/features/challenger/ui/record-code/LookupRecordForm"
import { SectionCard } from "@/features/challenger/ui/shared/SectionCard"

export function RecordCodePage() {
  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-6 px-8.5 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-5-semibold text-teal-gray-900">
          챌린저 기록 코드
        </h1>
        <p className="text-body-2-regular text-teal-gray-500">
          과거 챌린저 활동 기록을 위한 6자리 코드를 발급하거나, 코드를 입력해
          내용을 확인할 수 있습니다.
        </p>
      </header>

      <SectionCard
        title="코드 생성"
        description="기수, 지부, 학교, 파트, 역할, 이름을 선택해 코드를 발급받으세요."
      >
        <CreateRecordForm />
      </SectionCard>

      <SectionCard
        title="코드 조회"
        description="발급된 6자리 코드를 입력하면 관련 정보를 확인할 수 있습니다."
      >
        <LookupRecordForm />
      </SectionCard>
    </div>
  )
}
