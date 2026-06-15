import { type FaqItemData, FaqSection } from "../components/FaqSection"

const FAQ_ITEMS: FaqItemData[] = [
  {
    label: "Q1",
    question: (
      <p>
        <span className="font-bold">여러 프로젝트에 동시에 </span>
        <span className="font-light">지원할 수 있나요?</span>
      </p>
    ),
    answer: (
      <p>
        동일한 매칭 차수 내에는 하나의 프로젝트에만 지원할 수 있어요. 차수가
        바뀌면 다른 프로젝트에 새로 지원할 수 있어요.
      </p>
    ),
  },
  {
    label: "Q2",
    question: (
      <p>
        <span className="font-bold">같은 프로젝트에 여러 차수에 걸쳐 </span>
        <span className="font-normal">지원할 수 있나요?</span>
      </p>
    ),
    answer: (
      <p>
        네, 가능해요. 1차에 지원했다가 불합격하더라도 2차, 3차에 동일한
        프로젝트에 다시 지원할 수 있어요.
      </p>
    ),
  },
  {
    label: "Q3",
    question: (
      <p>
        <span className="font-bold">지원 폼 제출 후 수정</span>
        <span className="font-normal">이 가능한가요? </span>
        <span className="font-bold">지원을 취소</span>
        <span className="font-normal">할 수 있나요?</span>
      </p>
    ),
    answer: (
      <>
        <p>
          이미 제출한 지원 폼의 수정은 불가능해요. 단, 해당 매칭 차수가 종료되기
          전까지는 지원 취소가 가능해요.
        </p>
        <p>지원 취소 후 동일한 프로젝트에 지원 폼을 새롭게 제출할 수 있어요.</p>
      </>
    ),
  },
  {
    label: "Q4",
    question: (
      <p>
        <span className="font-bold">합/불 결과는 언제, 어디서 </span>
        <span className="font-normal">확인할 수 있나요?</span>
      </p>
    ),
    answer: (
      <>
        <p>
          매칭 차수가 종료된 후, 웹사이트의 '
          <span className="font-medium">내 지원 현황</span>' 페이지와 '
          <span className="font-medium">매칭 현황</span>' 페이지에서 확인할 수
          있어요.
        </p>
        <p>차수가 진행되는 동안에는 결과가 공개되지 않아요.</p>
      </>
    ),
  },
]

export function MakerChallengerFaqSection() {
  return (
    <FaqSection
      label="# 8  FAQ  (Design, FE, BE Challenger)"
      heading={
        <>
          <p>Design, FE, BE 챌린저들을 위해</p>
          <p>정리해 봤어요</p>
        </>
      }
      items={FAQ_ITEMS}
    />
  )
}
