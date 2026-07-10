# UMC Product Web v2

UMC Product Web v2는 UMC 데모데이 프로젝트의 팀원(PM/디자이너/개발자 등) 모집 공고 등록부터, 지원, 서류 심사, 팀 매칭, 활동 관리까지 리크루팅 전 과정을 지원하는 웹 서비스입니다.

## 목차

1. [소개](#1-소개)
2. [팀원 소개](#2-팀원-소개)
3. [주요 기능](#3-주요-기능)
4. [기술 스택](#4-기술-스택)
5. [개발 환경](#5-개발-환경)
6. [화면 구성](#6-화면-구성)
7. [폴더 구조](#7-폴더-구조)
8. [개발 가이드](#8-개발-가이드)
9. [배포 & 운영](#9-배포--운영)
10. [문의](#10-문의)

---

## 1. 소개

- **운영진**: 동아리 서비스 전반을 운영하며, 매칭 일정(차수)을 관리·공지하고 합류한 챌린저를 관리합니다.
- **PM(프로젝트 리더)**: 팀원을 모집할 프로젝트 공고를 등록하고, 자신의 프로젝트에 들어온 지원서를 심사해 합격자를 선별합니다.
- **챌린저(지원자, 예: 개발자·디자이너)**: 원하는 프로젝트 공고에 지원서를 제출하고, 매칭 결과를 확인합니다.
- 이 과정을 거쳐 팀에 최종 합류한 챌린저는 이후 활동 기록·상벌점 등을 관리받습니다.

- **서비스 URL**: [https://university.neordinary.com](https://university.neordinary.com)

## 2. 팀원 소개

<!-- TODO: 팀원 정보로 교체 -->

| 이름     | 역할             | GitHub                            |
| -------- | ---------------- | --------------------------------- |
| `<이름>` | `<역할, 예: FE>` | [@github-id](https://github.com/) |
| `<이름>` | `<역할>`         | [@github-id](https://github.com/) |
| `<이름>` | `<역할>`         | [@github-id](https://github.com/) |

## 3. 주요 기능

| 역할   | 기능                       | 설명                                                                                                    |
| ------ | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| 운영진 | 매칭 · 일정 관리           | 매칭 차수(라운드)를 생성·관리하고, 매칭 결과 공고를 발행합니다.                                         |
| 운영진 | 챌린저 관리                | 합류한 챌린저의 활동 기록을 조회하고 상벌점을 부여합니다.                                               |
| PM     | 프로젝트(공고) 등록 · 관리 | 모집 공고를 신규 등록·수정하고, 지원서 문항을 드래그 앤 드롭으로 구성하며, 공고 진행 상태를 관리합니다. |
| PM     | 지원 현황 · 지원서 심사    | 자신의 프로젝트에 들어온 지원자 목록과 지원서 상세를 확인하고 합/불을 판정합니다.                       |
| 챌린저 | 프로젝트 탐색 · 지원       | 모집 중인 프로젝트를 조회·필터링하고 지원서를 제출합니다.                                               |
| 챌린저 | 지원 결과 확인             | 자신의 지원 현황과 매칭 결과를 확인합니다.                                                              |
| 공통   | 로그인 · 회원가입          | 자체 로그인 또는 카카오 OAuth로 로그인·회원가입하고, 챌린저 자격 인증 절차를 거칩니다.                  |
| 공통   | 계정 설정                  | 비밀번호, 이메일, 닉네임 등 계정/프로필 정보를 변경합니다.                                              |
| 공통   | 사용성 조사                | 서비스 이용 후 사용성 조사에 응답합니다.                                                                |
| 공통   | 서비스 소개 페이지         | 로그인 전 랜딩 페이지를 제공하며, SEO를 위해 일부 경로를 정적으로 프리렌더링합니다.                     |

## 4. 기술 스택

| 카테고리              | 기술                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 코어 · 빌드           | React 19, Vite 7, TypeScript 5.7                                                                                                     |
| 라우팅                | TanStack Router (파일 기반, 타입 세이프)                                                                                             |
| 서버 상태             | TanStack Query 5                                                                                                                     |
| 클라이언트 상태       | Zustand 5                                                                                                                            |
| 폼 · 검증             | React Hook Form 7, Zod 4, @hookform/resolvers                                                                                        |
| 스타일 · UI           | Tailwind CSS 4, class-variance-authority, clsx, tailwind-merge, Radix UI(radix-ui), tw-animate-css, lucide-react                     |
| 애니메이션 · 인터랙션 | motion(Framer Motion), @dnd-kit                                                                                                      |
| HTTP · API 타입       | axios, openapi-typescript                                                                                                            |
| 콘텐츠 · 유틸         | react-markdown, dayjs, pretendard, web-vitals                                                                                        |
| 빌드 플러그인         | vite-plugin-svgr, vite-imagetools, @tailwindcss/vite, @vitejs/plugin-react, @tanstack/router-plugin                                  |
| 테스트                | Vitest, @testing-library/react, jsdom                                                                                                |
| 코드 품질             | ESLint 9(flat config), typescript-eslint, eslint-plugin-perfectionist, eslint-plugin-boundaries, eslint-plugin-react-hooks, Prettier |
| Git 훅 · 컨벤션       | husky, lint-staged, commitlint(gitmoji)                                                                                              |
| SSG · 이미지          | puppeteer, sharp                                                                                                                     |
| 패키지 매니저         | pnpm                                                                                                                                 |

## 5. 개발 환경

### 필요 버전

- Node.js `>= 22.12.0` (`.nvmrc` 기준 22)
- pnpm `10.28.0` (Corepack 사용 권장)

### 설치

```bash
corepack enable
pnpm install
```

### 환경 변수 설정

`.env.example`을 복사해 `.env` 파일을 생성한 뒤 값을 채웁니다.

```bash
cp .env.example .env
```

| 변수명                    | 설명                        |
| ------------------------- | --------------------------- |
| `VITE_API_BASE_URL`       | 백엔드 API 베이스 URL       |
| `VITE_GA_MEASUREMENT_ID`  | Google Analytics 측정 ID    |
| `VITE_GA_API_SAMPLE_RATE` | GA 이벤트 샘플링 비율       |
| `VITE_APPLE_CLIENT_ID`    | Apple 로그인 클라이언트 ID  |
| `VITE_APPLE_REDIRECT_URI` | Apple 로그인 리다이렉트 URI |
| `VITE_GOOGLE_CLIENT_ID`   | Google 로그인 클라이언트 ID |
| `VITE_KAKAO_APP_KEY`      | 카카오 로그인 앱 키         |

### 실행

```bash
# 개발 서버
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 빌드 + 프리렌더(SSG)
pnpm build:ssg

# 빌드 미리보기
pnpm preview
```

### 그 외 스크립트

| 스크립트                       | 설명                                               |
| ------------------------------ | -------------------------------------------------- |
| `pnpm lint`                    | ESLint 검사                                        |
| `pnpm lint:fix`                | ESLint 자동 수정                                   |
| `pnpm lint:boundaries`         | FSD 레이어 의존성 위반 검사                        |
| `pnpm format` / `format:check` | Prettier 포맷팅 적용 / 검사                        |
| `pnpm test` / `test:run`       | Vitest watch 실행 / 1회 실행                       |
| `pnpm generate:api-types`      | OpenAPI 스펙(`openapi.yaml`)에서 TS 타입 자동 생성 |

## 6. 화면 구성

<!-- TODO: 화면 캡처 이미지 추가 -->

| 화면            | 설명                    |
| --------------- | ----------------------- |
| `<캡처 이미지>` | 로그인 / 회원가입       |
| `<캡처 이미지>` | 프로젝트(공고) 등록     |
| `<캡처 이미지>` | 지원 현황 · 지원서 상세 |
| `<캡처 이미지>` | 매칭 관리               |
| `<캡처 이미지>` | 챌린저 관리             |

### 디자인 시스템

- `src/styles/`(color, typography, shadow)에 정의된 디자인 토큰을 Tailwind v4 `@theme`으로 노출해 사용합니다.
- Radix UI 기반 헤드리스 프리미티브(Dialog, Popover 등)에 Tailwind로 스타일을 직접 입히는 방식으로 모달·드롭다운·툴팁 등을 구성합니다.
- 버튼·인풋 등 반복 컴포넌트는 `class-variance-authority`로 variant를 정의해 타입 안전하게 관리합니다(`src/shared/ui`).

### 주요 인터랙션 · 플로우

- 지원서 문항 순서 편집: `@dnd-kit` 기반 드래그 앤 드롭 (`features/project/new`)
- 모집 공고 발행 → 지원 접수 → 지원서 심사(합/불) → 매칭 확정 → 결과 공고 발행으로 이어지는 매칭 플로우

## 7. 폴더 구조

```
src/
├── app/            # 앱 조립 루트 — main.tsx, app.css, authWiring.ts
├── routes/         # TanStack Router 파일 기반 라우트 (routeTree.gen.ts는 자동 생성, 수정 금지)
├── widgets/        # 여러 페이지에서 재사용되는 복합 UI (navigation, footer 등)
├── features/       # 도메인별 기능 단위 (ui / model / api / hooks)
│   └── <domain>/
├── entities/       # 여러 화면이 공유하는 도메인 데이터 (organization, member, project, application)
├── shared/         # 공용 UI · lib · api · hooks (도메인 비의존)
│   ├── ui/         # Primitive 컴포넌트 (Button, Modal, Dropdown, Toast 등)
│   ├── lib/        # axios 인스턴스, cn() 등 범용 유틸
│   └── assets/     # SVG 아이콘 (svgr 자동 생성)
├── styles/         # 디자인 토큰 CSS (color, typography, shadow)
├── types/          # API 타입 등 전역 타입 (api.d.ts는 자동 생성)
└── test/           # Vitest 전역 설정
```

레이어 간 의존 방향은 `app → routes → widgets → features → entities → shared`(역방향 참조 금지)이며, `eslint-plugin-boundaries`로 강제하고 `pnpm lint:boundaries`로 검사합니다.

## 8. 개발 가이드

### 브랜치 전략

`<타입>/<작업 내용>` 형식의 브랜치를 `develop`에서 분기해 PR로 병합합니다.

| 접두사      | 용도                    |
| ----------- | ----------------------- |
| `fix/`      | 버그 수정               |
| `feat/`     | 신규 기능               |
| `refactor/` | 기능 변경 없는 리팩토링 |
| `chore/`    | 빌드/설정/배포 등       |
| `task/`     | 문서화 등 기타 작업     |

이슈 번호를 포함하는 경우 `feat/#123-기능명` 형식을 사용합니다. `main`/`develop` 브랜치는 PR을 통해서만 병합되며, CI(`lint` → `lint:boundaries` → `build`)를 통과해야 합니다.

### 커밋 컨벤션

[Gitmoji](https://gitmoji.dev/) 규약을 따릅니다.
`commitlint`(`commitlint-config-gitmoji`)가 커밋 메시지를 자동으로 검증합니다.

```
✨ feat: 새로운 기능 추가
🐛 fix: 버그 수정
🔧 chore: 빌드 설정, 의존성 업데이트 등
♻️ refactor: 기능 변경 없는 코드 리팩토링
📝 docs: 문서 수정
✅ test: 테스트 코드 추가 및 수정
🎨 style: 코드 포맷팅, 구조 개선
```

### 코드 스타일

- ESLint 9(flat config) + typescript-eslint + `eslint-plugin-react-hooks`로 정적 검사.
- `eslint-plugin-perfectionist`로 import·named export 정렬을 강제해 diff 노이즈를 줄입니다.
- `eslint-plugin-boundaries`로 FSD 레이어 간 의존성 방향을 검사합니다.
- Prettier(+ `prettier-plugin-tailwindcss`)로 코드/클래스 포맷을 통일합니다.
- `husky` + `lint-staged`가 커밋 시 스테이지된 파일에 대해 자동으로 lint·format을 실행합니다(`.ts`/`.tsx`: ESLint --fix + Prettier, `.json`/`.md`/`.css`: Prettier).

## 9. 배포 & 운영

- **호스팅**: AWS Amplify (`amplify.yml`)
  - `preBuild`: Node/Corepack/pnpm 설정 후 `pnpm install --frozen-lockfile`
  - `build`: `pnpm run build`
  - 산출물: `dist/`, SPA 라우팅을 위해 모든 경로를 `index.html`로 리라이트
- **CI**: GitHub Actions (`.github/workflows/ci.yml`)
  - `main`, `develop` 대상 PR에서 `lint` → `lint:boundaries`(FSD 경계 위반 래칫 체크) → `build` 순으로 검증
- **버전 관리**: `CHANGELOG.md`에 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식, [Semantic Versioning](https://semver.org/lang/ko/) 기준으로 배포 이력을 기록
- **SEO**: `scripts/prerender.mjs`(puppeteer)로 소개 페이지 등 일부 경로를 정적 프리렌더링, `public/sitemap.xml` · `public/robots.txt` 제공

## 10. 문의

버그 제보 및 기능 제안은 [UMC PRODUCT 카카오톡 채널](https://pf.kakao.com/_MDxhqX/chat)로 연락해주세요.
