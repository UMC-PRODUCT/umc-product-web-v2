# umc-product-web-v2

UMC Product 웹 프론트엔드 v2 프로젝트입니다.

## 기술 스택

| 카테고리             | 기술                        |
| -------------------- | --------------------------- |
| UI 라이브러리        | React 19                    |
| 빌드 도구            | Vite 7                      |
| 언어                 | TypeScript 5                |
| 라우팅               | TanStack Router (파일 기반) |
| 서버 상태 관리       | TanStack React Query        |
| 클라이언트 상태 관리 | Zustand                     |
| HTTP 클라이언트      | Axios                       |
| CSS 프레임워크       | Tailwind CSS v4             |
| 폼 관리              | React Hook Form + Zod       |
| 아이콘               | lucide-react                |
| 날짜 처리            | dayjs                       |
| 테스트               | Vitest + Testing Library    |
| 패키지 매니저        | pnpm                        |

## 시작하기

### 사전 요구사항

- Node.js 20 이상
- pnpm

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

| 변수명              | 설명                  | 예시                        |
| ------------------- | --------------------- | --------------------------- |
| `VITE_API_BASE_URL` | 백엔드 API 베이스 URL | `http://localhost:8080/api` |

## 프로젝트 구조

```
src/
├── api/            # API 호출 함수
├── assets/
│   └── icons/      # SVG 아이콘 에셋
├── components/
│   └── ui/         # 공통 UI 컴포넌트 (shadcn/ui 패턴)
├── hooks/          # 커스텀 훅
├── lib/
│   ├── axios.ts    # Axios 인스턴스 (JWT 인터셉터 포함)
│   └── utils.ts    # cn() 유틸리티 함수
├── routes/         # TanStack Router 파일 기반 라우트
│   ├── __root.tsx  # 루트 레이아웃
│   └── index.tsx   # 홈 페이지 (/)
├── stores/         # Zustand 전역 상태 스토어
├── test/
│   └── setup.ts    # Vitest 전역 설정
└── types/          # 공통 타입 정의 (api.d.ts 자동 생성 포함)
```

> `api/`, `components/ui/`, `hooks/`, `stores/`, `types/` 디렉토리는 초기 세팅 단계로 현재 비어 있습니다.

### 주요 파일

| 파일                    | 설명                                                                       |
| ----------------------- | -------------------------------------------------------------------------- |
| `src/lib/axios.ts`      | Axios 인스턴스. JWT Bearer 토큰 자동 주입, 401 응답 시 `/login` 리다이렉트 |
| `src/lib/utils.ts`      | `cn()` 함수 (clsx + tailwind-merge)                                        |
| `src/routes/__root.tsx` | QueryClient Provider 포함 루트 레이아웃                                    |
| `src/routeTree.gen.ts`  | TanStack Router 자동 생성 파일 (수정 금지)                                 |

## 스크립트

| 스크립트                  | 설명                                       |
| ------------------------- | ------------------------------------------ |
| `pnpm dev`                | 개발 서버 실행                             |
| `pnpm build`              | 프로덕션 빌드                              |
| `pnpm preview`            | 프로덕션 빌드 미리보기                     |
| `pnpm lint`               | ESLint 검사                                |
| `pnpm lint:fix`           | ESLint 자동 수정                           |
| `pnpm format`             | Prettier 포맷팅 적용                       |
| `pnpm format:check`       | Prettier 포맷팅 검사                       |
| `pnpm test`               | 테스트 실행 (watch 모드)                   |
| `pnpm test:run`           | 테스트 1회 실행                            |
| `pnpm generate:api-types` | OpenAPI 스펙에서 TypeScript 타입 자동 생성 |

## 코드 컨벤션

### 커밋 메시지

[Gitmoji](https://gitmoji.dev/) 규약을 따릅니다. `commitlint`가 커밋 메시지를 자동으로 검증합니다.

```
✨ feat: 새로운 기능 추가
🐛 fix: 버그 수정
🔧 chore: 빌드 설정, 의존성 업데이트 등
♻️ refactor: 기능 변경 없는 코드 리팩토링
📝 docs: 문서 수정
✅ test: 테스트 코드 추가 및 수정
🎨 style: 코드 포맷팅, 구조 개선
```

### 린트 및 포맷팅

커밋 전 `lint-staged`가 자동으로 실행됩니다.

- `.ts`, `.tsx` 파일: ESLint 자동 수정 + Prettier 포맷팅
- `.json`, `.md`, `.css` 파일: Prettier 포맷팅
