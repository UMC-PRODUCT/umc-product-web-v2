import { Button } from "@/components/common/Button"

import { ProjectCardForm } from "./ProjectCardForm/ProjectCardForm"
import { SectionHeader } from "./SectionHeader"

const MOCK_USER = { nickname: "닉넴", name: "아무개", university: "OO대 OOO" }
export function BasicInfoForm() {
  return (
    <div className="flex flex-col gap-14 py-4">
      <div className="flex flex-col gap-4">
        <SectionHeader index={1} title="프로젝트 카드" />
        <ProjectCardForm {...MOCK_USER} />
      </div>
      <div className="flex flex-col gap-4">
        <SectionHeader index={2} title="기획서 링크" />
        <label htmlFor="planning-link" className="sr-only">
          기획서 링크
        </label>
        <input
          id="planning-link"
          type="url"
          className="border-teal-gray-150 text-body-1-regular text-teal-gray-600 h-14 w-full overflow-x-auto rounded-[12px] border px-5 py-4"
          placeholder="이곳에 링크를 입력해주세요"
        />
      </div>
      <div className="flex justify-end gap-4">
        <Button variant="weak" color="neutral">
          이전
        </Button>
        <Button variant="fill" color="brand">
          다음
        </Button>
      </div>
    </div>
  )
}
