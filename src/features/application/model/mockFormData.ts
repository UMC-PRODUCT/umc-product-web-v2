import type { Role } from "./types"

export interface FormField {
  label: string
  question: string
  answer: string
  required?: boolean
}

export interface ApplicantFormData {
  applicantId: string
  chapter: string
  role: Role
  projectName: string
  challengerName: string
  challengerUniversity: string
  commonFields: FormField[]
  roleSection?: {
    title: string
    fields: FormField[]
  }
}

export const MOCK_FORM_DATA: Record<string, ApplicantFormData> = {
  "3-1": {
    applicantId: "3-1",
    chapter: "Chromium",
    role: "design",
    projectName: "UMC_Web",
    challengerName: "벨라/황지원",
    challengerUniversity: "중앙대",
    commonFields: [
      {
        label: "Q1",
        question: "본인의 닉네임/이름을 적어주세요.",
        answer: "이방토/이예원",
        required: true,
      },
      {
        label: "Q2",
        question: "합격 문자 전송을 위해 전화번호를 작성해주세요.",
        answer: "이방토/이예원",
        required: true,
      },
      {
        label: "Q3",
        question: "소속 학교/전공을 적어주세요.",
        answer: "한양대 ERICA / 커뮤니케이션디자인학과",
        required: true,
      },
      {
        label: "Q3",
        question: "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요.",
        answer: "2026_UXUI 포트폴리오_이방토",
        required: true,
      },
      {
        label: "Q3",
        question: "대략적인 고정일정을 알려주세요.",
        answer: "월.수.일 알바가 있습니다.",
        required: true,
      },
      {
        label: "Q3",
        question: "하고 싶은 말이나 참고 사항이 있다면 자유롭게 적어주세요.",
        answer: "화이팅 ~~",
      },
    ],
    roleSection: {
      title: "Design",
      fields: [
        {
          label: "Q3",
          question: "사용 가능한 기술 스택을 선택하세요.",
          answer: "옵션 1",
          required: true,
        },
        {
          label: "Q5",
          question: "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요.",
          answer: "2026_UXUI 포트폴리오_이방토",
          required: true,
        },
      ],
    },
  },
  "3-2": {
    applicantId: "3-2",
    chapter: "Chromium",
    role: "design",
    projectName: "UMC_Web",
    challengerName: "벨라/황지원",
    challengerUniversity: "중앙대",
    commonFields: [
      {
        label: "Q1",
        question: "본인의 닉네임/이름을 적어주세요.",
        answer: "이방토/이예원",
        required: true,
      },
      {
        label: "Q2",
        question: "합격 문자 전송을 위해 전화번호를 작성해주세요.",
        answer: "이방토/이예원",
        required: true,
      },
      {
        label: "Q3",
        question: "소속 학교/전공을 적어주세요.",
        answer: "한양대 ERICA / 시각디자인학과",
        required: true,
      },
    ],
  },
  "3-3": {
    applicantId: "3-3",
    chapter: "Chromium",
    role: "android",
    projectName: "UMC_Web",
    challengerName: "벨라/황지원",
    challengerUniversity: "중앙대",
    commonFields: [
      {
        label: "Q1",
        question: "본인의 닉네임/이름을 적어주세요.",
        answer: "이방토/이예원",
        required: true,
      },
      {
        label: "Q2",
        question: "합격 문자 전송을 위해 전화번호를 작성해주세요.",
        answer: "이방토/이예원",
        required: true,
      },
      {
        label: "Q3",
        question: "소속 학교/전공을 적어주세요.",
        answer: "한양대 ERICA / 컴퓨터공학과",
        required: true,
      },
    ],
  },
}
