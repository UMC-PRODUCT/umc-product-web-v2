import { ProjectCardForm } from "./ProjectCardForm/ProjectCardForm"

const MOCK_USER = { nickname: "닉넴", name: "아무개", university: "OO대 OOO" }
export function BasicInfoForm() {
  return (
    <div className="flex flex-col gap-14 py-4">
      <div className="flex flex-col gap-4">
        <div className="text-heading-6-semibold flex gap-2">
          <span className="text-teal-600">01</span>
          <span className="text-teal-gray-900">프로젝트 카드</span>
        </div>
        <ProjectCardForm {...MOCK_USER} />
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-heading-6-semibold flex gap-2">
          <span className="text-teal-600">02</span>
          <span className="text-teal-gray-900">기획서 링크</span>
        </div>
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
      <div className="flex justify-end">
        <div className="text-label-1-medium flex gap-4">
          <button
            type="button"
            className="bg-teal-gray-150 text-teal-gray-600 h-11 w-22.5 rounded-[12px] px-4 py-1 text-center"
          >
            이전
          </button>
          <button
            type="button"
            className="h-11 w-22.5 rounded-[12px] bg-teal-600 px-4 py-1 text-center text-white"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  )
}
