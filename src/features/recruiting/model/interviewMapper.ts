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
  if (questions.length === 0) return null
  return {
    group,
    title,
    questions: questions
      .slice()
      .sort((a, b) => a.orderNo - b.orderNo)
      .map((question) => ({ text: question.content })),
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
