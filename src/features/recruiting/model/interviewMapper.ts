import type { RecruitingInterviewQuestion } from "../api/types"
import type {
  InterviewContent,
  InterviewQuestionBlock,
} from "./applicationDetail"

function toBlock(
  group: InterviewQuestionBlock["group"],
  title: string,
  questions: RecruitingInterviewQuestion[],
): InterviewQuestionBlock | null {
  // 조회 API 가 활성 질문만 준다고 알려져 있지만, 응답에 active 가 실려 오므로
  // 여기서도 거른다. 이 함수만 놓고 봐도 결과가 맞아야 한다.
  const active = questions.filter((question) => question.active)
  if (active.length === 0) return null
  return {
    group,
    title,
    questions: active
      .slice()
      .sort((a, b) => a.orderNo - b.orderNo)
      .map((question) => ({ id: String(question.id), text: question.content })),
    // 답변을 저장·조회하는 경로가 아직 없다. 질문만 채운다.
    answers: [],
  }
}

export function toInterviewContent(
  roundQuestions: RecruitingInterviewQuestion[],
  applicationQuestions: RecruitingInterviewQuestion[],
): InterviewContent | null {
  const blocks = [
    toBlock("common", "공통 질문", roundQuestions),
    toBlock("individual", "개별 질문", applicationQuestions),
  ].filter((block): block is InterviewQuestionBlock => block != null)

  if (blocks.length === 0) return null
  return { blocks }
}
