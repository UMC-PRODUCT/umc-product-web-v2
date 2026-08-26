# Storybook 인수인계 문서

- 독자: 다음 프론트엔드 유지보수 담당자
- 소유자: UMC Product Web 프론트엔드 담당자
- 기준일: 2026-08-26

## 도입 목적

현재 `src/routes/test`에는 컴포넌트를 실제 앱 라우트 안에서 확인하는 테스트 페이지가 있습니다. 이 방식은 페이지 조합을 확인하기에는 적합하지만, 인증·라우터·API 없이 공통 UI와 핵심 업무 UI의 상태를 빠르게 비교하기 어렵습니다.

Storybook은 공통 UI와 핵심 업무 UI를 독립적으로 렌더링해 다음 정보를 한곳에서 제공합니다.

- 컴포넌트가 지원하는 props와 상태
- disabled·loading·error·empty 등 확인하기 어려운 상태
- 클릭·입력·선택과 같은 대표 상호작용
- 자동 생성되는 props 문서와 Controls
- 모집·지원·매칭·평가 feature가 공통 UI를 조합하는 방식

제품 컴포넌트의 public API나 시각 스타일을 Storybook 도입을 위해 변경하지 않습니다.

## 실행 방법

프로젝트 루트에서 실행합니다.

```bash
pnpm storybook
```

기본 주소는 `http://localhost:6006`입니다. 배포 가능한 정적 결과물이 필요한 경우 다음 명령을 사용합니다.

```bash
pnpm build-storybook
```

정적 결과물인 `storybook-static`은 Git에 포함하지 않습니다.

## 구조

`.storybook`은 Storybook 자체의 실행 환경만 관리합니다.

| 파일                        | 역할                                                     |
| :-------------------------- | :------------------------------------------------------- |
| `.storybook/main.ts`        | 스토리 검색 위치, React-Vite 프레임워크, Docs 설정       |
| `.storybook/preview.ts`     | 모든 스토리에 적용되는 전역 CSS와 기본 parameters        |
| `.storybook/vite.config.ts` | Storybook에 필요한 Tailwind CSS, SVG import, `@/*` alias |

앱의 `vite.config.ts`에는 TanStack Router 코드 생성 플러그인이 있으므로 Storybook은 전용 Vite 설정을 사용합니다. Storybook에서 페이지 라우트를 생성하거나 `src/routeTree.gen.ts`를 변경하지 않습니다.

스토리는 컴포넌트 옆에 작성합니다.

```text
src/shared/ui/
├── Button.tsx
├── Button.stories.tsx
├── input/
│   ├── InputBox.tsx
│   └── InputBox.stories.tsx
└── modal/
    ├── CtaModal.tsx
    └── CtaModal.stories.tsx
```

현재 1차 문서화 대상은 다음 두 레이어입니다.

공통 UI:

- Button
- InputBox
- Checkbox
- OptionButton / OptionButtonGroup
- Toggle
- CtaModal
- Toast
- Tooltip
- SearchField
- Tag / RecruitStatusChip

핵심 업무 UI:

- 모집: `RecruitmentPreviewCard`, `RecruitmentNoticeCard`, `RecruitmentPostRow`, `RecruitmentStepper`, `RecruitmentStatusChip`
- 지원: `RecruitmentApplyConfirmModal`, `RecruitQuestionsViewModal`
- 매칭: `MatchingTypeSelector`, `RoundForm`
- 평가: `EvaluationStatusChip`

feature 스토리는 실제 API·인증·라우터 없이 대표 mock 데이터를 사용합니다. 화면 전체를 복제하기보다 상태 조합과 컴포넌트 간 역할을 보여주는 경계가 명확한 UI를 우선합니다.

feature story의 `parameters.routePath`에는 해당 UI가 사용되는 실제 앱 경로를 기록합니다. Storybook canvas 상단에 이 경로가 표시되지만, 경로 이동·인증 확인·라우터 provider 실행은 하지 않습니다. 여러 화면에서 사용되는 경우 문자열 배열로 여러 경로를 기록할 수 있습니다.

## 스토리 작성 규칙

### 파일과 메타 정보

파일 이름은 대상 컴포넌트 이름에 `.stories.tsx`를 붙입니다. CSF 형식과 `Meta`, `StoryObj` 타입을 사용합니다.

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./Button"

const meta = {
  title: "Shared UI/Button",
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>
```

스토리 이름은 구현 방식이 아니라 확인하려는 상태를 나타냅니다.

- `Default`: 기본 사용 상태
- `Disabled`: 비활성 상태
- `Loading`: 처리 중 상태
- `Selected`: 선택 상태
- `Error`: 오류 상태
- `Interactive`: 대표 사용 흐름
- `LongContent`: 긴 문구·줄바꿈 상태

### 상태 구성 기준

모든 조합을 무조건 스토리로 만들지 않습니다. 다음 기준으로 유지보수에 의미 있는 상태를 선택합니다.

1. 사용자가 실제로 볼 수 있는 시각 상태인가
2. props 조합으로 회귀가 발생하기 쉬운가
3. 제품 흐름에서 반복적으로 사용되는가
4. 기존 테스트 페이지에서 확인하던 중요한 상태인가

정적인 상태는 `args`나 `render`로 구성합니다. 서버 응답, 인증, 라우터, 실제 API 데이터는 스토리에 넣지 않습니다. API나 라우터에 직접 결합된 페이지는 별도 mock adapter를 만들지 않는 한 Storybook 대상에서 제외합니다.

### Controlled component

`value`, `checked`, `open`처럼 부모가 상태를 관리하는 컴포넌트는 story 안에 작은 controlled wrapper를 둡니다.

- story가 초기 상태를 직접 선언합니다.
- wrapper가 내부 state를 갱신합니다.
- 원래 전달받은 callback도 함께 호출해 Actions에서 확인할 수 있게 합니다.
- 제품 컴포넌트에 Storybook 전용 상태 API를 추가하지 않습니다.

### Portal component

Modal과 Tooltip은 document body에 Portal을 생성합니다.

- Modal은 `CtaModal`에 `open`과 외부 트리거를 함께 구성합니다.
- Portal로 렌더링된 요소는 story canvas 바깥에 있을 수 있으므로 `screen`으로 찾습니다.
- Portal이 닫혔는지 확인할 때는 callback 호출과 DOM 상태를 함께 확인합니다.
- Storybook에서만 필요한 `modal-root`를 제품 코드에 추가하지 않습니다.

### 라우트 경로 표시

라우트 경로는 실행 대상이 아니라 인수인계용 문맥입니다.

```tsx
const meta = {
  title: "Feature/Matching/RoundForm",
  component: RoundForm,
  parameters: {
    routePath: "/matching/rounds",
  },
} satisfies Meta<typeof RoundForm>
```

이 설정은 전역 decorator가 `사용 라우트` 정보로 표시합니다. Storybook에서는 TanStack Router의 `Route`, `beforeLoad`, 인증 store를 불러오지 않으므로 로그인이나 실제 페이지 이동 없이 UI 상태를 확인할 수 있습니다. 실제 권한·라우팅·페이지 조합은 제품 라우트와 `src/routes/test`에서 검증합니다.

## 상호작용 검증

대표 상호작용은 story의 `play` 함수에 작성합니다.

```tsx
import { expect } from "storybook/test"

export const Interactive: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "확인" }))
    await expect(canvas.getByRole("button")).toBeInTheDocument()
  },
}
```

현재는 Storybook 화면에서 재현하고 확인하는 수준으로 운영합니다. 별도의 Vitest addon, 시각 회귀 CI, Storybook 배포는 포함하지 않습니다.

## 새 스토리 추가 절차

1. 대상 컴포넌트와 기존 테스트 라우트의 상태를 확인합니다.
2. 컴포넌트와 같은 디렉터리에 `ComponentName.stories.tsx`를 만듭니다.
3. `Meta`와 `StoryObj`를 선언하고 `Shared UI/...` 또는 `Feature/...` 제목을 지정합니다.
4. 기본 상태와 중요한 경계 상태를 `args` 또는 `render`로 추가합니다.
5. 상태가 부모 관리형이면 controlled wrapper를 작성합니다.
6. feature UI라면 실제 사용 경로를 `parameters.routePath`에 기록합니다.
7. 사용자가 수행하는 대표 동작은 `play` 함수로 추가합니다.
8. Storybook 개발 서버에서 확인합니다.
9. `pnpm build-storybook`와 기존 `pnpm test:run`을 실행합니다.

## 기존 테스트 라우트와의 역할

기존 `src/routes/test` 라우트는 이번 작업에서 삭제하지 않습니다.

| 도구              | 목적                                                                 |
| :---------------- | :------------------------------------------------------------------- |
| Storybook         | 공통 UI와 핵심 업무 UI의 props·상태·대표 상호작용·사용 라우트 문서화 |
| `src/routes/test` | 실제 라우터와 페이지 조합 안에서 화면 흐름 확인                      |

새 공통 UI와 API 독립적인 feature UI의 상태 문서는 Storybook을 우선 사용합니다. 실제 라우터·페이지 조합이나 API 연결이 필요한 확인은 기존 테스트 라우트를 사용합니다.

## 검증 명령

```bash
pnpm lint
pnpm test:run
pnpm build
pnpm build-storybook
```

Storybook 실행과 빌드 후에는 다음도 확인합니다.

- 모든 `*.stories.tsx`가 목록에 표시되는가
- Modal과 Tooltip Portal이 정상 표시되는가
- `src/routeTree.gen.ts`가 변경되지 않았는가
- 실제 API나 인증 없이 스토리가 렌더링되는가
- `storybook-static`이 Git 변경사항에 포함되지 않는가

## 다음 확장 후보

이번 확장 범위에서도 다음 항목은 다루지 않습니다.

- 모집·매칭·지원·평가 페이지 전체
- API와 인증에 직접 결합된 Feature UI
- Storybook 배포와 GitHub Pages
- 시각 회귀 테스트와 CI 실행

다음 확장 후보는 지원자 목록의 필터·테이블, 모집 문항 편집 UI, 매칭 배정 UI처럼 mock 경계를 만들 수 있는 복합 feature UI입니다. 각 후보는 API 의존성을 끌어오지 않고도 독립 상태를 설명할 수 있는지 먼저 검토합니다.
