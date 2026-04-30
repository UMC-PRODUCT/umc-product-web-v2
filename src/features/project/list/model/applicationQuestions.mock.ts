import type { Section } from "@/features/project/new/model/applicationQuestion"

const DEFAULT_SECTIONS: Section[] = [
  {
    id: "common",
    name: "공통 문항",
    isEnabled: true,
    questions: [
      {
        id: "q-c1",
        title: "본인의 닉네임/이름을 적어주세요.",
        caption: "",
        fieldType: "text",
        required: true,
        options: [],
      },
      {
        id: "q-c2",
        title: "합격 문자 전송을 위해 전화번호를 작성해주세요.",
        caption: "",
        fieldType: "text",
        required: true,
        options: [],
      },
      {
        id: "q-c3",
        title: "소속 학교/전공을 적어주세요.",
        caption: "",
        fieldType: "text",
        required: true,
        options: [],
      },
      {
        id: "q-c4",
        title: "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요.",
        caption:
          "링크를 입력하거나 파일을 첨부해 주세요. 150MB 이하의 PDF 파일만 업로드 가능합니다.",
        fieldType: "portfolio",
        required: true,
        options: [],
      },
      {
        id: "q-c5",
        title: "대략적인 고정일정을 알려주세요.",
        caption: "",
        fieldType: "text",
        required: true,
        options: [],
      },
      {
        id: "q-c6",
        title: "하고 싶은 말이나 참고 사항이 있다면 자유롭게 적어주세요.",
        caption: "",
        fieldType: "text",
        required: false,
        options: [],
      },
    ],
  },
  {
    id: "design",
    name: "Design",
    isEnabled: true,
    questions: [
      {
        id: "q-d1",
        title: "사용 가능한 기술 스택을 선택하세요.",
        caption: "",
        fieldType: "checkbox",
        required: true,
        options: ["Figma", "Illustration"],
      },
      {
        id: "q-d2",
        title: "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요.",
        caption:
          "링크를 입력하거나 파일을 첨부해 주세요. 150MB 이하의 PDF 파일만 업로드 가능합니다.",
        fieldType: "portfolio",
        required: true,
        options: [],
      },
    ],
  },
  {
    id: "frontend",
    name: "Frontend",
    isEnabled: true,
    questions: [
      {
        id: "q-f1",
        title: "사용 가능한 기술 스택을 선택하세요.",
        caption: "",
        fieldType: "checkbox",
        required: true,
        options: ["Figma", "Github"],
      },
      {
        id: "q-f2",
        title: "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요.",
        caption:
          "링크를 입력하거나 파일을 첨부해 주세요. 150MB 이하의 PDF 파일만 업로드 가능합니다.",
        fieldType: "portfolio",
        required: true,
        options: [],
      },
    ],
  },
  {
    id: "backend",
    name: "Backend",
    isEnabled: false,
    questions: [
      {
        id: "q-b1",
        title: "주력으로 사용하는 언어를 선택하세요.",
        caption: "",
        fieldType: "radio",
        required: true,
        options: ["Java", "Kotlin", "Python", "Node.js", "Go"],
      },
      {
        id: "q-b2",
        title: "사용 가능한 기술 스택을 모두 선택하세요.",
        caption: "",
        fieldType: "checkbox",
        required: true,
        options: [
          "Spring Boot",
          "Django",
          "FastAPI",
          "NestJS",
          "Docker",
          "AWS",
        ],
      },
      {
        id: "q-b3",
        title: "본인의 백엔드 경험을 간단히 소개해 주세요.",
        caption: "",
        fieldType: "text",
        required: true,
        options: [],
      },
      {
        id: "q-b4",
        title: "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요.",
        caption:
          "링크를 입력하거나 파일을 첨부해 주세요. 150MB 이하의 PDF 파일만 업로드 가능합니다.",
        fieldType: "portfolio",
        required: false,
        options: [],
      },
      {
        id: "q-b5",
        title: "관련 파일이 있다면 첨부해 주세요.",
        caption: "",
        fieldType: "file",
        required: false,
        options: [],
      },
    ],
  },
]

const PROJECT_APPLICATION_SECTIONS_MAP: Record<string, Section[]> = {
  "mock-matching-1": DEFAULT_SECTIONS,
}

export function getApplicationSections(projectId: string): Section[] {
  return PROJECT_APPLICATION_SECTIONS_MAP[projectId] ?? DEFAULT_SECTIONS
}
