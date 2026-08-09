import type {
  ApplyGuideNotice,
  ApplyGuideQaItem,
} from "@/features/recruiting/model/applyGuide"

interface ApplyGuideCardProps {
  notice: ApplyGuideNotice
  qaItems: readonly ApplyGuideQaItem[]
}

/**
 * 지원 방법 안내 공지 카드.
 *
 * 공지 목록의 카드와 생김새는 같지만 접히지 않는다. 이 화면에는 공지가 하나뿐이라
 * 접는 동작이 읽기를 막기만 한다. 그래서 목록용 아코디언을 가져다 쓰지 않고
 * 정적으로 그린다. 문답 구조는 `dl` 로 표현해 화면 낭독기가 질문과 답을 짝지어
 * 읽게 한다.
 */
export function ApplyGuideCard({ notice, qaItems }: ApplyGuideCardProps) {
  return (
    <article className="shadow-drop-neutral-3 border-teal-gray-100 w-full rounded-[12px] border bg-white p-8">
      <div className="px-4 pt-4 pb-7">
        {/* TODO: 공용 칩 컴포넌트로 교체 */}
        <span className="shadow-drop-neutral-3 text-body-3-medium inline-flex w-fit items-center rounded-[6px] bg-teal-100 px-2.5 py-0.5 text-teal-600">
          {notice.chip}
        </span>

        <div className="flex flex-col gap-2 pt-2.5">
          <h2 className="text-heading-6-semibold text-teal-600">
            {notice.title}
          </h2>
          <p className="text-body-3-medium text-teal-gray-500">
            작성 일자: {notice.date}
          </p>
        </div>
      </div>

      <div className="shadow-inner-neutral-2 bg-teal-gray-50 text-teal-gray-900 rounded-[12px] px-8 pt-6 pb-7.5">
        <dl className="flex flex-col gap-6">
          {qaItems.map((item) => (
            <div key={item.id} className="flex flex-col gap-2">
              <dt className="text-body-1-semibold">{item.question}</dt>
              <dd className="text-body-1-regular leading-relaxed break-words">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}
