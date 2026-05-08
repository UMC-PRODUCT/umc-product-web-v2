import type { ApplicantFormData } from "@/features/application/model/mockFormData"
import type { ApplicantDetail } from "@/features/application/model/types"

export const MOCK_MATCHING_APPLICANTS: Record<string, ApplicantDetail> = {
  "m-1": {
    id: "m-1",
    round: 1,
    role: "web",
    name: "이수민",
    university: "인하대학교",
    status: "pass",
    processedAt: { date: "2026.04.20", time: "14:00" },
    appliedAt: { date: "2026.04.10", time: "09:30" },
  },
  "m-2": {
    id: "m-2",
    round: 2,
    role: "web",
    name: "박지훈",
    university: "서울대학교",
    status: "pass",
    processedAt: { date: "2026.04.21", time: "10:00" },
    appliedAt: { date: "2026.04.11", time: "11:20" },
  },
  "m-3": {
    id: "m-3",
    round: 3,
    role: "web",
    name: "최서연",
    university: "연세대학교",
    status: "pass",
    processedAt: { date: "2026.04.22", time: "15:30" },
    appliedAt: { date: "2026.04.12", time: "08:45" },
  },
  "m-4": {
    id: "m-4",
    round: 1,
    role: "springboot",
    name: "정민준",
    university: "고려대학교",
    status: "pass",
    processedAt: { date: "2026.04.20", time: "14:00" },
    appliedAt: { date: "2026.04.10", time: "10:00" },
  },
  "m-5": {
    id: "m-5",
    round: 2,
    role: "springboot",
    name: "한예진",
    university: "성균관대학교",
    status: "pass",
    processedAt: { date: "2026.04.21", time: "11:00" },
    appliedAt: { date: "2026.04.11", time: "14:30" },
  },
  "m-6": {
    id: "m-6",
    round: 1,
    role: "design",
    name: "김하늘",
    university: "홍익대학교",
    status: "pass",
    processedAt: { date: "2026.04.20", time: "16:00" },
    appliedAt: { date: "2026.04.10", time: "12:15" },
  },
}

export const MOCK_MATCHING_FORM_DATA: Record<string, ApplicantFormData> = {
  "m-1": {
    applicantId: "m-1",
    chapter: "Chromium",
    role: "web",
    projectName: "UMC Product",
    challengerName: "김도현",
    challengerUniversity: "인하대학교",
    commonFields: [
      {
        label: "Q1",
        question: "본인의 닉네임/이름을 적어주세요.",
        answer: "이수민",
        required: true,
      },
      {
        label: "Q2",
        question: "합격 문자 전송을 위해 전화번호를 작성해주세요.",
        answer: "010-1234-5678",
        required: true,
      },
      {
        label: "Q3",
        question: "소속 학교/전공을 적어주세요.",
        answer: "인하대학교 / 컴퓨터공학과",
        required: true,
      },
      {
        label: "Q4",
        question: "대략적인 고정일정을 알려주세요.",
        answer: "화, 목 수업이 있습니다.",
        required: true,
      },
      {
        label: "Q5",
        question: "하고 싶은 말이나 참고 사항이 있다면 자유롭게 적어주세요.",
        answer: "열심히 하겠습니다!",
      },
    ],
    roleSection: {
      title: "Web",
      fields: [
        {
          label: "Q1",
          question: "사용 가능한 기술 스택을 선택하세요.",
          answer: "React, TypeScript, Next.js",
          required: true,
        },
        {
          label: "Q2",
          question: "GitHub 프로필 링크를 작성해주세요.",
          answer: "https://github.com/sumin-lee",
          required: true,
        },
      ],
    },
  },
  "m-2": {
    applicantId: "m-2",
    chapter: "Chromium",
    role: "web",
    projectName: "UMC Product",
    challengerName: "김도현",
    challengerUniversity: "인하대학교",
    commonFields: [
      {
        label: "Q1",
        question: "본인의 닉네임/이름을 적어주세요.",
        answer: "박지훈",
        required: true,
      },
      {
        label: "Q2",
        question: "합격 문자 전송을 위해 전화번호를 작성해주세요.",
        answer: "010-2345-6789",
        required: true,
      },
      {
        label: "Q3",
        question: "소속 학교/전공을 적어주세요.",
        answer: "서울대학교 / 소프트웨어학과",
        required: true,
      },
    ],
    roleSection: {
      title: "Web",
      fields: [
        {
          label: "Q1",
          question: "사용 가능한 기술 스택을 선택하세요.",
          answer: "Vue.js, TypeScript",
          required: true,
        },
      ],
    },
  },
  "m-3": {
    applicantId: "m-3",
    chapter: "Chromium",
    role: "web",
    projectName: "UMC Product",
    challengerName: "김도현",
    challengerUniversity: "인하대학교",
    commonFields: [
      {
        label: "Q1",
        question: "본인의 닉네임/이름을 적어주세요.",
        answer: "최서연",
        required: true,
      },
      {
        label: "Q2",
        question: "합격 문자 전송을 위해 전화번호를 작성해주세요.",
        answer: "010-3456-7890",
        required: true,
      },
      {
        label: "Q3",
        question: "소속 학교/전공을 적어주세요.",
        answer: "연세대학교 / 컴퓨터과학과",
        required: true,
      },
    ],
  },
  "m-4": {
    applicantId: "m-4",
    chapter: "Chromium",
    role: "springboot",
    projectName: "UMC Product",
    challengerName: "김도현",
    challengerUniversity: "인하대학교",
    commonFields: [
      {
        label: "Q1",
        question: "본인의 닉네임/이름을 적어주세요.",
        answer: "정민준",
        required: true,
      },
      {
        label: "Q2",
        question: "합격 문자 전송을 위해 전화번호를 작성해주세요.",
        answer: "010-4567-8901",
        required: true,
      },
      {
        label: "Q3",
        question: "소속 학교/전공을 적어주세요.",
        answer: "고려대학교 / 컴퓨터공학과",
        required: true,
      },
    ],
    roleSection: {
      title: "SpringBoot",
      fields: [
        {
          label: "Q1",
          question: "사용 가능한 기술 스택을 선택하세요.",
          answer: "Spring Boot, JPA, MySQL",
          required: true,
        },
      ],
    },
  },
  "m-5": {
    applicantId: "m-5",
    chapter: "Chromium",
    role: "springboot",
    projectName: "UMC Product",
    challengerName: "김도현",
    challengerUniversity: "인하대학교",
    commonFields: [
      {
        label: "Q1",
        question: "본인의 닉네임/이름을 적어주세요.",
        answer: "한예진",
        required: true,
      },
      {
        label: "Q2",
        question: "합격 문자 전송을 위해 전화번호를 작성해주세요.",
        answer: "010-5678-9012",
        required: true,
      },
      {
        label: "Q3",
        question: "소속 학교/전공을 적어주세요.",
        answer: "성균관대학교 / 소프트웨어학과",
        required: true,
      },
    ],
  },
  "m-6": {
    applicantId: "m-6",
    chapter: "Chromium",
    role: "design",
    projectName: "UMC Product",
    challengerName: "김도현",
    challengerUniversity: "인하대학교",
    commonFields: [
      {
        label: "Q1",
        question: "본인의 닉네임/이름을 적어주세요.",
        answer: "김하늘",
        required: true,
      },
      {
        label: "Q2",
        question: "합격 문자 전송을 위해 전화번호를 작성해주세요.",
        answer: "010-6789-0123",
        required: true,
      },
      {
        label: "Q3",
        question: "소속 학교/전공을 적어주세요.",
        answer: "홍익대학교 / 시각디자인학과",
        required: true,
      },
    ],
    roleSection: {
      title: "Design",
      fields: [
        {
          label: "Q1",
          question: "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요.",
          answer: "2026_포트폴리오_김하늘.pdf",
          required: true,
        },
      ],
    },
  },
}
