import { type FaqItemData, FaqSection } from "../components/FaqSection"

const FAQ_ITEMS: FaqItemData[] = [
  {
    label: "Q1",
    question: (
      <>
        <p>
          <span className="font-bold">프로젝트 등록 후 수정</span>
          <span className="font-light">이 가능한가요?</span>
        </p>
        <p>
          <span className="font-bold">
            매칭 진행 중에도 지원 폼 문항을 수정
          </span>
          <span className="text-[32px] font-light tracking-[-0.96px]">
            할 수 있나요?
          </span>
        </p>
      </>
    ),
    answer: (
      <>
        <p>
          매칭이 진행되는 동안에는 프로젝트 정보와 지원 폼 문항 수정할 수
          없어요.
        </p>
        <p>
          예를 들어, n차 매칭이 끝나고 다음 n차 매칭이 시작되기 전의 기간에는
          자유롭게 수정할 수 있어요.
        </p>
      </>
    ),
  },
  {
    label: "Q2",
    question: (
      <p>
        <span className="font-bold">지원 폼 문항을 수정</span>
        <span className="font-normal">하면 어떻게 되나요?</span>
      </p>
    ),
    answer: (
      <>
        <p>
          Plan 챌린저가 문항을 수정하면 차수에 따라 지원자에게 보이는 문항이
          달라지고
        </p>
        <p>
          Plan 챌린저 또한 차수별로 서로 다른 문항 구성의 지원서를 검토하게
          돼요.
        </p>
        <p>
          매칭이 진행되는 동안에는 지원 폼 문항을 수정할 수 없다는 점 유의해
          주세요!
        </p>
      </>
    ),
  },
  {
    label: "Q3",
    question: (
      <>
        <p>
          <span className="font-bold">지원자 합/불 처리는 언제</span>
          <span className="font-light">부터 가능한가요?</span>
        </p>
        <p>
          <span className="font-light">한 번 불합격 처리한 지원자를 </span>
          <span className="font-bold">다시 합격으로 바꿀 수 </span>
          <span className="font-light">있나요?</span>
        </p>
      </>
    ),
    answer: (
      <>
        <p>
          지원자 합/불 처리는 해당 차수가 종료된 후부터 다음 차수가 시작되기
          전까지 가능해요.
        </p>
        <p>
          이 기간 안에는 합/불 상태를 자유롭게 변경할 수 있어요. 단, 다음 차수가
          시작되면 결정을 번복할 수 없어요.
        </p>
      </>
    ),
  },
  {
    label: "Q4",
    question: (
      <p>
        <span className="font-bold">지원자가 아무도 없는 파트</span>
        <span className="font-normal">는 어떻게 처리되나요?</span>
      </p>
    ),
    answer: (
      <p>
        1차, 2차, 3차 매칭을 거쳐도 TO가 채워지지 않은 파트는 랜덤으로 팀원이
        배정될 예정이에요.
      </p>
    ),
  },
]

export function PlanChallengerFaqSection() {
  return (
    <FaqSection
      label={
        <>
          {"# 7  FAQ "}
          <span className="text-[#2cad9e]">(Plan Challenger)</span>
        </>
      }
      heading={
        <>
          <p>Plan 챌린저들을 위해 정리해 봤어요</p>
          <p>&nbsp;</p>
        </>
      }
      items={FAQ_ITEMS}
    />
  )
}
