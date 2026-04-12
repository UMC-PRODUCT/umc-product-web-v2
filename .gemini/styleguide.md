# umc-product-web-v2 코드 리뷰 스타일 가이드

이 문서는 Gemini Code Assist가 이 저장소의 PR을 리뷰할 때 따라야 할 규칙입니다.
기본 5개 리뷰 축(Correctness / Efficiency / Maintainability / Security / Miscellaneous)은
유지하되, 아래 항목을 우선적으로 검토해주세요.

## 커뮤니케이션

- **리뷰 코멘트는 한국어로 작성**합니다. 기술 용어·식별자는 원문 유지.
- 변경의 의도를 먼저 요약한 뒤 제안은 구체적 근거와 함께 제시합니다.

## 커밋·이모지

- 커밋 메시지는 [Gitmoji](https://gitmoji.dev/) 규약을 따릅니다
  (`commitlint-config-gitmoji`로 검증). `<이모지> <type>: <설명>` 포맷.
- **코드/파일/문서 내부에 이모지를 넣지 않습니다.** (gitmoji는 커밋 메시지 한정 예외)

## 주석

- **코드는 자체 설명적이어야 하며 주석 작성을 지양**합니다. JSDoc·인라인 주석 모두 지양.
- 로직이 자명하지 않은 경우에만 최소한의 주석을 허용합니다.
- 변경하지 않은 코드에 주석만 추가하는 제안은 피해주세요.

## 명명 규칙

| 대상              | 규칙                                 | 예시                             |
| ----------------- | ------------------------------------ | -------------------------------- |
| 변수·함수         | camelCase                            | `userProfile`, `fetchData`       |
| React 컴포넌트    | PascalCase                           | `UserCard`, `LoginForm`          |
| 커스텀 훅         | `use` prefix + camelCase             | `useAuth`, `useModalOpen`        |
| 타입·인터페이스   | PascalCase                           | `UserResponse`, `FormValues`     |
| Zod 스키마        | camelCase + `Schema` suffix          | `loginFormSchema`                |
| Zustand 스토어    | camelCase + `Store` suffix           | `useAuthStore`                   |
| 상수              | UPPER_SNAKE_CASE                     | `MAX_RETRY_COUNT`                |
| 컴포넌트 파일     | PascalCase + `.tsx`                  | `UserCard.tsx`                   |
| 일반 유틸·훅 파일 | camelCase + `.ts` / `.tsx`           | `useAuth.ts`, `formatDate.ts`    |
| 라우트 파일       | TanStack Router 규칙 (`_`, `$`, `.`) | `_auth.login.tsx`, `$userId.tsx` |
| 테스트 파일       | 대상 파일명 + `.test.ts(x)`          | `UserCard.test.tsx`              |

- 식별자는 **영어**만 사용합니다. 한국어·약어·줄임말은 사용하지 않습니다.
- boolean 변수/prop은 `is`, `has`, `can`, `should` prefix를 권장합니다 (`isLoading`, `hasError`).
- 이벤트 핸들러는 `handle` prefix를 권장합니다 (`handleSubmit`, `handleClose`).

## TypeScript

- `any` 금지. 필요한 경우 `unknown` + 타입 좁히기.
- `tsconfig` 엄격 옵션 준수: `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess`, `verbatimModuleSyntax`.
- 미사용 변수는 이름 앞에 `_` prefix로 예외 처리.
- 경로 alias `@/*` (= `src/*`) 사용을 권장합니다.

## React

- React 19 함수형 컴포넌트만 사용. 훅 규칙(`react-hooks/rules-of-hooks`,
  `exhaustive-deps`) 엄격 준수.
- 컴포넌트는 재사용 가능하도록 분리하며, 반응형 디자인(Tailwind breakpoint)을 필수로 고려.
- prop drilling이 깊어지면 Zustand 또는 context로 분리.

## 상태 관리·데이터

- 서버 상태: **TanStack React Query** 사용. fetch/axios 직접 호출을 컴포넌트에 두지 않음.
- 클라이언트 전역 상태: **Zustand**.
- 폼: **React Hook Form + Zod**.
- HTTP: `src/lib/axios.ts`의 Axios 인스턴스를 통해 호출 (JWT 주입·401 리다이렉트 포함).

## 스타일링

- **Tailwind CSS v4**. 인라인 스타일·CSS-in-JS 지양.
- 클래스 병합은 `cn()` 유틸리티(`src/lib/utils.ts`)를 사용.
- 아이콘: `lucide-react` 또는 svgr로 생성된 `@/assets/svg` 컴포넌트.

## 라우팅

- **TanStack Router 파일 기반 라우트**. `src/routes/` 규칙을 따릅니다.
- `src/routeTree.gen.ts`는 **자동 생성 파일이며 절대 직접 수정하지 않습니다.**

## 테스트

- 단위 테스트: **Vitest + Testing Library**.
- 새 기능·버그 수정에는 가능한 한 테스트를 동반합니다.

## 불필요한 복잡도 지양

- 요청되지 않은 기능 추가·"개선"·리팩토링을 섞지 않습니다.
- 발생할 수 없는 시나리오에 대한 방어 코드·fallback·feature flag를 추가하지 않습니다.
  시스템 경계(외부 API, 사용자 입력)에서만 validation.
- 1회성 작업을 위한 추상화·헬퍼·유틸리티를 만들지 않습니다.
- 3줄의 유사한 코드가 성급한 추상화보다 낫습니다.

## 보안

- 민감 정보(토큰, API 키, 쿠키, PII)를 로그에 남기지 않습니다.
- 사용자 입력은 Zod 스키마 등으로 검증합니다.
- `dangerouslySetInnerHTML` 사용 시 XSS 위험을 명확히 검토합니다.

## 자동 생성 파일

아래는 리뷰 대상이 아니며, 이 경로에 대한 변경은 별도 의견을 내지 않습니다.

- `src/routeTree.gen.ts`
- `src/types/api.d.ts`
- `src/assets/svg/**` (svgr 생성물)
- `pnpm-lock.yaml`
