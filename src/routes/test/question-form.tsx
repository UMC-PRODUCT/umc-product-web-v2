import { createFileRoute } from "@tanstack/react-router"
import { useRef, useState } from "react"

import { FormHeader } from "@/shared/ui/FormHeader"
import { CheckboxFieldList } from "@/shared/ui/question-field/CheckboxFieldList"
import { FileUploadField } from "@/shared/ui/question-field/FileUploadField"
import { QuestionForm } from "@/shared/ui/question-field/QuestionForm"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"
import { RadioFieldList } from "@/shared/ui/question-field/RadioFieldList"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

export const Route = createFileRoute("/test/question-form")({
  component: QuestionFormTestPage,
})

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className={"flex flex-col gap-4"}>
      <h2 className="border-teal-gray-100 text-label-1-semibold text-teal-gray-500 border-b pb-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

function TextFormSection({
  index,
  defaultTitle,
  defaultCaption,
  focused,
}: {
  index: string
  defaultTitle: string
  defaultCaption?: string
  focused: boolean
}) {
  const [title, setTitle] = useState(defaultTitle)
  const [caption, setCaption] = useState(defaultCaption ?? "")
  const [value, setValue] = useState("")
  const [required, setRequired] = useState(false)

  return (
    <QuestionForm
      index={index}
      title={title}
      onTitleChange={setTitle}
      caption={caption}
      onCaptionChange={setCaption}
      focused={focused}
      required={required}
      onRequiredChange={setRequired}
      onDelete={() => alert(`${index} 삭제`)}
    >
      <TextQuestionField value={value} onChange={setValue} />
    </QuestionForm>
  )
}

function RadioFormSection() {
  const [title, setTitle] = useState("단일 선택 질문을 작성하세요")
  const [caption, setCaption] = useState("")
  const [options, setOptions] = useState([{ content: "옵션 1" }])
  const [required, setRequired] = useState(false)

  return (
    <QuestionForm
      index="Q4"
      title={title}
      onTitleChange={setTitle}
      caption={caption}
      onCaptionChange={setCaption}
      focused
      required={required}
      onRequiredChange={setRequired}
      onDelete={() => alert("Q4 삭제")}
    >
      <RadioFieldList options={options} onOptionsChange={setOptions} />
    </QuestionForm>
  )
}

function CheckboxFormSection() {
  const [title, setTitle] = useState("복수 선택 질문을 작성하세요")
  const [caption, setCaption] = useState("")
  const [options, setOptions] = useState([{ content: "옵션 1" }])
  const [required, setRequired] = useState(false)

  return (
    <QuestionForm
      index="Q5"
      title={title}
      onTitleChange={setTitle}
      caption={caption}
      onCaptionChange={setCaption}
      focused
      required={required}
      onRequiredChange={setRequired}
      onDelete={() => alert("Q5 삭제")}
    >
      <CheckboxFieldList options={options} onOptionsChange={setOptions} />
    </QuestionForm>
  )
}

function FileFormSection() {
  const [title, setTitle] = useState("파일 업로드 질문을 작성하세요")
  const [caption, setCaption] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const [required, setRequired] = useState(false)

  return (
    <QuestionForm
      index="Q6"
      title={title}
      onTitleChange={setTitle}
      caption={caption}
      onCaptionChange={setCaption}
      focused
      required={required}
      onRequiredChange={setRequired}
      onDelete={() => alert("Q6 삭제")}
    >
      <FileUploadField
        fileName={fileName}
        onUpload={() => setFileName("이력서_홍길동.pdf")}
        onDelete={() => setFileName(null)}
      />
    </QuestionForm>
  )
}

function QuestionFormTestPage() {
  const [partToggled, setPartToggled] = useState(true)

  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        QuestionForm Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Focus=False — caption 없음">
          <TextFormSection
            index="Q1"
            defaultTitle="작성된 첫번째 질문"
            focused={false}
          />
        </Section>

        <Section title="Focus=False — caption 포함">
          <TextFormSection
            index="Q2"
            defaultTitle="작성된 두번째 질문"
            defaultCaption="답변에 대한 설명을 입력할 수 있습니다"
            focused={false}
          />
        </Section>

        <Section title="Focus=True — Text 필드 (title/caption 직접 수정 가능)">
          <TextFormSection
            index="Q3"
            defaultTitle="질문을 작성하세요"
            focused
          />
        </Section>

        <Section title="Focus=True — RadioFieldList (옵션 동적 추가)">
          <RadioFormSection />
        </Section>

        <Section title="Focus=True — CheckboxFieldList (옵션 동적 추가)">
          <CheckboxFormSection />
        </Section>

        <Section title="Focus=True — FileUploadField">
          <FileFormSection />
        </Section>

        <Section title="조합 — FormHeader(Part) + QuestionForm 상하 결합">
          <div className="flex w-full max-w-225 flex-col">
            <FormHeader
              variant="part"
              partName="Part 1"
              toggleChecked={partToggled}
              onToggleChange={setPartToggled}
            />
            <TextFormSection
              index="Q1"
              defaultTitle="파트에 속한 질문"
              focused
            />
          </div>
        </Section>

        <Section title="반응형 — 부모 폭 제한">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-label-2-medium text-teal-gray-500 mb-2">
                600px
              </p>
              <div className="w-150">
                <TextFormSection
                  index="Q1"
                  defaultTitle="600px 컨테이너 내 질문"
                  focused={false}
                />
              </div>
            </div>
            <div>
              <p className="text-label-2-medium text-teal-gray-500 mb-2">
                800px
              </p>
              <div className="w-200">
                <TextFormSection
                  index="Q1"
                  defaultTitle="800px 컨테이너 내 질문"
                  focused={false}
                />
              </div>
            </div>
            <div>
              <p className="text-label-2-medium text-teal-gray-500 mb-2">
                full (max 900px)
              </p>
              <TextFormSection
                index="Q1"
                defaultTitle="Full 폭 질문 (max-w-[900px])"
                focused={false}
              />
            </div>
          </div>
        </Section>

        <Section title="TextQuestionField — 단독 (포커스 시 카운터 표시)">
          <StandaloneTextFieldRow />
        </Section>

        <Section title="QuestionItemTitle — Caption Off / On">
          <div className="flex flex-col gap-4">
            <QuestionItemTitle index="Q1" title="작성된 첫번째 질문" />
            <QuestionItemTitle
              index="Q1"
              title="질문을 작성하세요"
              caption="설명 (선택 사항)"
            />
          </div>
        </Section>

        <Section title="QuestionItemTitle — 다양한 index 및 긴 텍스트">
          <div className="flex flex-col gap-4">
            <QuestionItemTitle index="00" title="Text Title" />
            <QuestionItemTitle
              index="01"
              title="Text Title"
              caption="Text Caption"
            />
            <QuestionItemTitle index="Q1" title="지원 동기" />
            <QuestionItemTitle
              index="Q2"
              title="자기소개"
              caption="500자 이내로 작성해주세요"
            />
            <QuestionItemTitle
              index="Q10"
              title="추가 질문"
              caption="선택 사항"
            />
            <QuestionItemTitle
              index="Q3"
              title="본인이 지원한 동기와 이 활동을 통해 얻고자 하는 점에 대해 구체적으로 작성해주세요"
              caption="최대 300자"
            />
            <QuestionItemTitle
              index="Q4"
              title="경력 사항"
              caption="해당 직무와 관련된 경력 사항을 최신순으로 기재하되, 재직 기간과 담당 업무를 상세히 작성해주세요."
            />
          </div>
        </Section>

        <Section title="QuestionItemTitle — 반응형 컨테이너">
          <div className="flex flex-col gap-4">
            <div className="border-teal-gray-100 w-75 rounded-lg border bg-white p-4">
              <QuestionItemTitle
                index="Q1"
                title="좁은 컨테이너에서의 제목 렌더링"
                caption="캡션도 함께 줄바꿈되는지 확인합니다"
              />
            </div>
            <div className="border-teal-gray-100 w-125 rounded-lg border bg-white p-4">
              <QuestionItemTitle
                index="Q2"
                title="중간 너비 컨테이너에서의 제목 렌더링"
                caption="캡션 (선택 사항)"
              />
            </div>
            <div className="border-teal-gray-100 w-200 rounded-lg border bg-white p-4">
              <QuestionItemTitle
                index="Q3"
                title="넓은 컨테이너에서의 제목 렌더링"
                caption="캡션 (선택 사항)"
              />
            </div>
          </div>
        </Section>

        <Section title="FileUploadField — 상태별 (QuestionForm 밖)">
          <div className="flex flex-col gap-4">
            <FileUploadField onUpload={() => {}} onDelete={() => {}} />
            <FileUploadField
              placeholder="링크를 입력하거나 파일을 첨부해 주세요. 100MB 이하의 PDF 파일만 업로드 가능합니다."
              onUpload={() => {}}
              onDelete={() => {}}
            />
            <FileUploadField
              fileName="2026_UXUI 포트폴리오_이방토"
              onUpload={() => {}}
              onDelete={() => {}}
            />
            <FileUploadField
              fileName="2026_아주매우엄청나게긴파일이름을넣어서_truncate_동작확인_테스트_매우길게_프리텐다드_폰트.pdf"
              onUpload={() => {}}
              onDelete={() => {}}
            />
            <InteractiveFileUploadRow />
          </div>
        </Section>
      </div>
    </main>
  )
}

function StandaloneTextFieldRow() {
  const [value, setValue] = useState("")
  return (
    <div className="flex flex-col gap-2">
      <TextQuestionField value={value} onChange={setValue} />
      <p className="text-caption-1-medium text-teal-gray-500">
        state: {value.length === 0 ? "default" : "filled"} (focus 시 카운터
        표시)
      </p>
    </div>
  )
}

function InteractiveFileUploadRow() {
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) setFileName(file.name)
    event.target.value = ""
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <FileUploadField
        fileName={fileName}
        placeholder="링크를 입력하거나 파일을 첨부해 주세요. 100MB 이하의 PDF 파일만 업로드 가능합니다."
        onUpload={() => inputRef.current?.click()}
        onDelete={() => setFileName(null)}
      />
      <span className="text-caption-1-medium text-teal-gray-500">
        현재 파일: {fileName ?? "없음"}
      </span>
    </div>
  )
}
