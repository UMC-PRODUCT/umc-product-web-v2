# 리크루팅 역할·헤더 권한 정렬 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/recruiting/*`, `/projects/*`, `/manage/*`의 로그인·비로그인 분기와 역할별 헤더·라우팅 가드를 UMC 서버 권한 계약 및 피그마 헤더 스펙에 맞춘다.

**Architecture:** 서버 권한의 단일 기준을 프런트 capability 함수로 표현하고, 루트 리다이렉트·라우트 `beforeLoad`·헤더 탭 노출이 같은 함수를 사용하도록 정렬한다. 지원 작성은 로그인 사용자의 `/v1/recruiting/applications`와 게스트의 `/v1/recruiting/public/applications`를 분리하고, 익명 초안 식별자와 약관 응답 타입을 서버 계약에 맞춘다. 헤더는 네비게이션 활성 정책, 모집 상태 CTA, 프로필 아바타를 독립 책임으로 나눈다.

**Tech Stack:** React, TypeScript, TanStack Router, TanStack Query, Axios, Tailwind CSS, Vitest, Vite, UMC `/umc-api` 검증 절차

---

## 작업 범위와 권한 기준

브랜치는 현재 `feat/#688-header-role-branching` 하나를 유지하고 PR도 하나만 유지한다. 아래 작업은 같은 브랜치에서 논리적 커밋 여러 개로 진행한다. 새로운 브랜치·PR은 만들지 않는다.

서버 기준은 UMC 서버 저장소의 `origin/develop` 최신 커밋을 사용한다.

- `src/main/java/com/umc/product/recruiting/application/service/evaluator/RecruitingPermissionEvaluator.java`
- `src/main/java/com/umc/product/authorization/domain/AuthoritySnapshot.java`
- `src/main/java/com/umc/product/common/domain/enums/ChallengerRoleType.java`
- `src/main/java/com/umc/product/organization/application/service/evaluator/SchoolPermissionEvaluator.java`
- `src/main/java/com/umc/product/organization/application/service/evaluator/ChapterPermissionEvaluator.java`

리크루팅의 리소스 ID가 없는 진입 권한은 `SUPER_ADMIN`, 중앙 회장, 중앙 부회장, 학교 회장, 학교 부회장으로 제한한다. 특정 차수·폼·학교 리소스에서는 서버가 기수·학교 범위를 추가 검증하므로 프런트 가드는 진입 메뉴를 제어하고 최종 권한은 서버에 맡긴다.

| 역할                                                             | 리크루팅 헤더/라우트 | 설정 헤더/라우트 | 서버 기준           |
| ---------------------------------------------------------------- | -------------------- | ---------------- | ------------------- |
| `SUPER_ADMIN`                                                    | 허용                 | 허용             | 중앙 핵심           |
| `CENTRAL_PRESIDENT`, `CENTRAL_VICE_PRESIDENT`                    | 허용                 | 허용             | 중앙 핵심           |
| `SCHOOL_PRESIDENT`, `SCHOOL_VICE_PRESIDENT`                      | 허용                 | 불허             | 학교 운영 핵심      |
| `CENTRAL_OPERATING_TEAM_MEMBER`, `CENTRAL_EDUCATION_TEAM_MEMBER` | 불허                 | 불허             | 중앙 핵심 아님      |
| `CHAPTER_PRESIDENT`                                              | 불허                 | 불허             | 리크루팅 권한 없음  |
| 학교 파트장·기타 운영진                                          | 불허                 | 불허             | 리크루팅 권한 없음  |
| 일반 챌린저·게스트                                               | 불허                 | 불허             | 인증 또는 권한 없음 |

## 파일 책임 지도

### 역할·라우팅 정책

- Modify: `src/entities/member/model/identity.ts` — 서버 기준 capability 함수
- Test: `src/entities/member/model/identity.test.ts` — 역할별 허용·거부 행렬
- Modify: `src/routes/index.tsx` — 로그인 사용자의 기본 랜딩 분기
- Modify: `src/routes/recruiting/route.tsx` — 리크루팅 진입 가드
- Modify: `src/routes/manage/route.tsx` — 설정 진입 가드

### 게스트·로그인 지원 흐름

- Modify: `src/features/recruiting/ui/apply/RecruitingApplyPage.tsx` — 초안 식별자 사용
- Verify: `src/features/recruiting/hooks/useApplyMutations.ts` — 로그인·익명 mutation 분기 유지
- Verify: `src/features/recruiting/api/recruitingApi.ts` — 공개·인증 API 엔드포인트 계약 테스트 대상
- Modify: `src/shared/api/terms.ts` — 서버의 문자열 int64 약관 ID 정규화
- Test: `src/features/recruiting/api/recruitingApi.test.ts`
- Test: `src/features/recruiting/model/applyDraftStorage.test.ts`

### 헤더·프로필 UI

- Modify: `src/widgets/navigation/header/RecruitingHeader.tsx` — 인증 상태에 따른 CTA와 탭 조합
- Modify: `src/widgets/navigation/header/RecruitingStatusButton.tsx` — 모집 상태별 렌더링
- Modify: `src/widgets/navigation/header/GuestProfileButton.tsx` — 게스트 오픈·마감 로그인 색상
- Modify: `src/widgets/navigation/header/recruitingHeaderNav.ts` — 모집 안내 활성 경로와 프로젝트 경로 충돌 해결
- Test: `src/widgets/navigation/header/recruitingHeaderNav.test.ts`
- Create: `src/shared/ui/profile/ProfileAvatar.tsx` — 피그마 공용 프로필 표현 컴포넌트
- Test: `src/shared/ui/profile/ProfileAvatar.test.tsx`
- Modify: `src/widgets/navigation/header/Profile.tsx`
- Modify: `src/widgets/navigation/header/ProfileDropdown.tsx`

### 검증용 코드와 생성 파일

- Modify: `src/routes/test/recruiting-header.tsx` — 개발 중 역할·모집 상태 시나리오 확장
- Create: `src/routes/test/route.tsx` — `/test/*` 개발 환경 공통 가드
- Modify: `src/routeTree.gen.ts` — 테스트 부모 라우트 생성 후 갱신

## Task 1: 서버 권한 행렬을 프런트 capability 함수에 반영

**Files:**

- Modify: `src/entities/member/model/identity.ts:59-114`
- Test: `src/entities/member/model/identity.test.ts:80-125`

- [ ] **Step 1: 서버와 다른 역할을 실패 조건으로 추가한다.**

중앙 운영팀원, 중앙 교육팀원, 지부장은 리크루팅 capability가 false여야 한다. 중앙 핵심과 학교 회장단은 true로 유지한다. 설정은 중앙 핵심만 true여야 한다.

```ts
it("서버가 리크루팅을 허용하지 않는 중앙 실무·지부 역할은 false", () => {
  expect(isRecruitingOperator(makeMe(["CENTRAL_OPERATING_TEAM_MEMBER"]))).toBe(
    false,
  )
  expect(isRecruitingOperator(makeMe(["CENTRAL_EDUCATION_TEAM_MEMBER"]))).toBe(
    false,
  )
  expect(isRecruitingOperator(makeMe(["CHAPTER_PRESIDENT"]))).toBe(false)
})

it("설정은 중앙 핵심만 true", () => {
  expect(isCentralAdmin(makeMe(["SUPER_ADMIN"]))).toBe(true)
  expect(isCentralAdmin(makeMe(["CENTRAL_PRESIDENT"]))).toBe(true)
  expect(isCentralAdmin(makeMe(["CENTRAL_OPERATING_TEAM_MEMBER"]))).toBe(false)
})
```

- [ ] **Step 2: 역할 테스트만 실행해 수정 전 실패를 확인한다.**

```bash
pnpm exec vitest run src/entities/member/model/identity.test.ts
```

Expected: 새 중앙 실무·교육·지부장 및 설정 중앙 실무 테스트가 FAIL한다.

- [ ] **Step 3: 서버와 동일한 최소 capability 판정으로 변경한다.**

```ts
export function isCentralAdmin(me: MemberInfoResponse | undefined): boolean {
  return isCentralCore(me)
}

export function isRecruitingOperator(
  me: MemberInfoResponse | undefined,
): boolean {
  return isCentralCore(me) || isSchoolLeadership(me)
}
```

기존 `isOperator`, `isAnyOperator`, `isCentralStaff`는 프로젝트·사이드바 등 다른 영역의 의미가 있으므로 전역 의미를 바꾸지 않는다.

- [ ] **Step 4: 역할 테스트가 통과하는지 확인한다.**

```bash
pnpm exec vitest run src/entities/member/model/identity.test.ts
```

Expected: 중앙 실무·교육팀원과 지부장은 false이고 중앙 핵심·학교 회장단만 true다.

- [ ] **Step 5: 같은 브랜치에 논리적 커밋을 만든다.**

```bash
git add src/entities/member/model/identity.ts src/entities/member/model/identity.test.ts
git commit -m "fix: 서버 권한 기준 역할 capability 정렬"
```

## Task 2: 루트·리크루팅·설정 라우트가 같은 capability를 사용하도록 정렬

**Files:**

- Modify: `src/routes/index.tsx:24-28`
- Modify: `src/routes/recruiting/route.tsx:14-24`
- Modify: `src/routes/manage/route.tsx:18-27`

- [ ] **Step 1: 세 라우트의 권한 조건을 확인한다.**

```bash
rg -n "isAnyOperator|isOperator|isCentralStaff|isCentralAdmin|isRecruitingOperator" src/routes/index.tsx src/routes/recruiting/route.tsx src/routes/manage/route.tsx
```

Expected:

- `/` 운영자 랜딩은 `isRecruitingOperator`를 사용한다.
- `/recruiting`의 `beforeLoad`는 `ensureMe` 후 `isRecruitingOperator`를 사용한다.
- `/manage`의 `beforeLoad`는 `ensureMe` 후 `isCentralAdmin`을 사용한다.

- [ ] **Step 2: 인증 실패와 역할 실패 흐름을 유지한다.**

```ts
const me = await ensureMe(context.queryClient, location.href)
if (!isRecruitingOperator(me)) {
  notifyAccessDenied()
  throw redirect({ to: "/" })
}
```

비로그인은 `ensureMe`의 `/login` 및 `returnTo` 처리를 사용하고, 로그인했지만 역할이 없으면 접근 거부 후 `/`로 이동한다. 설정 라우트는 같은 구조에서 조건만 `isCentralAdmin(me)`을 사용한다.

- [ ] **Step 3: 정적 검사 후 커밋한다.**

```bash
pnpm exec eslint src/routes/index.tsx src/routes/recruiting/route.tsx src/routes/manage/route.tsx
pnpm exec tsc --noEmit
git add src/routes/index.tsx src/routes/recruiting/route.tsx src/routes/manage/route.tsx
git commit -m "fix: 역할별 리크루팅과 설정 라우트 가드 정렬"
```

Expected: ESLint와 TypeScript가 PASS한다.

## Task 3: 게스트·로그인 지원 API 계약을 테스트로 고정하고 약관 ID를 정규화

**Files:**

- Modify: `src/features/recruiting/api/recruitingApi.test.ts`
- Modify: `src/shared/api/terms.ts`
- Create: `src/shared/api/terms.test.ts`

- [ ] **Step 1: 공개·인증 엔드포인트 테스트를 추가한다.**

공개 mutation은 다음 경로를 사용해야 한다.

```ts
expect(api.post).toHaveBeenCalledWith(
  "/v1/recruiting/public/applications",
  expect.any(Object),
)
expect(api.put).toHaveBeenCalledWith(
  "/v1/recruiting/public/applications",
  expect.any(Object),
)
expect(api.post).toHaveBeenCalledWith(
  "/v1/recruiting/public/applications/submit",
  expect.any(Object),
)
```

인증 mutation은 `/v1/recruiting/applications` 및 해당 ID 하위 경로를 사용해야 한다.

```ts
expect(api.post).toHaveBeenCalledWith(
  "/v1/recruiting/applications",
  expect.any(Object),
)
expect(api.put).toHaveBeenCalledWith(
  "/v1/recruiting/applications/application-1",
  expect.any(Object),
)
expect(api.post).toHaveBeenCalledWith(
  "/v1/recruiting/applications/application-1/submit",
  {},
)
```

- [ ] **Step 2: 테스트를 실행해 현재 공개·인증 분기를 확인한다.**

```bash
pnpm exec vitest run src/features/recruiting/api/recruitingApi.test.ts
```

Expected: 공개 및 인증 API 매핑 테스트가 PASS한다.

- [ ] **Step 3: 문자열 약관 ID를 API 경계에서 숫자로 정규화한다.**

실제 개발 서버가 `result.id`를 문자열로 반환할 수 있으므로 화면과 mutation context에는 숫자만 전달한다.

```ts
interface RawPublicTermResponse {
  id: number | string
  link: string
  isMandatory: boolean
}

export interface PublicTermResponse {
  id: number
  link: string
  isMandatory: boolean
}

export async function getPublicTermByType(
  termType: TermType,
): Promise<PublicTermResponse> {
  const { data } = await api.get<ApiResponse<RawPublicTermResponse>>(
    `/v1/terms/type/${termType}`,
  )
  const id = Number(data.result.id)
  if (!Number.isFinite(id)) throw new Error("invalid public term id")
  return { ...data.result, id }
}
```

- [ ] **Step 4: 문자열 응답 테스트와 API 테스트를 통과시킨다.**

```bash
pnpm exec vitest run src/features/recruiting/api/recruitingApi.test.ts src/shared/api/terms.test.ts
pnpm exec tsc --noEmit
```

Expected: `id: "1"` 응답이 숫자 `1`로 정규화되고 모든 테스트가 PASS한다.

- [ ] **Step 5: API 계약 커밋을 만든다.**

```bash
git add src/features/recruiting/api/recruitingApi.test.ts src/shared/api/terms.ts src/shared/api/terms.test.ts
git commit -m "test: 게스트와 로그인 지원 API 계약 고정"
```

## Task 4: 게스트 초안의 “새로 시작”이 익명 세션 키를 삭제하도록 수정

**Files:**

- Modify: `src/features/recruiting/ui/apply/RecruitingApplyPage.tsx:67-75,266-271`
- Test: `src/features/recruiting/model/applyDraftStorage.test.ts`

- [ ] **Step 1: 익명 세션 식별자 삭제 테스트를 추가한다.**

```ts
it("익명 세션 초안은 익명 세션 식별자로 삭제한다", () => {
  writeApplyDraft("7", "anonymous-session-1", DRAFT)
  clearApplyDraft("7", "anonymous-session-1")

  expect(readApplyDraft("7", "anonymous-session-1")).toBeNull()
  expect(readApplyDraft("7", "")).toBeNull()
})
```

- [ ] **Step 2: 화면의 모든 초안 참조를 `storageIdentity` 기준으로 통일한다.**

페이지에서 이미 읽기·저장·제출 오류 정리에 `storageIdentity`를 사용하므로 “새로 시작”도 같은 값을 사용한다.

```tsx
const storageIdentity = isAnonymous ? anonymousSessionId : memberId

onClick={() => {
  clearApplyDraft(roundId, storageIdentity)
  setResumeDecided(true)
}}
```

- [ ] **Step 3: 초안 테스트·타입 검사를 실행하고 커밋한다.**

```bash
pnpm exec vitest run src/features/recruiting/model/applyDraftStorage.test.ts
pnpm exec eslint src/features/recruiting/ui/apply/RecruitingApplyPage.tsx
pnpm exec tsc --noEmit
git add src/features/recruiting/ui/apply/RecruitingApplyPage.tsx src/features/recruiting/model/applyDraftStorage.test.ts
git commit -m "fix: 게스트 지원서 새로 시작 시 익명 초안 초기화"
```

Expected: 게스트에서 기존 익명 초안이 삭제되고 새 입력으로 다시 저장된다.

## Task 5: 모집 안내·프로젝트 네비게이션 활성 상태를 라우트와 일치

**Files:**

- Modify: `src/widgets/navigation/header/recruitingHeaderNav.ts`
- Modify: `src/widgets/navigation/header/recruitingHeaderNav.test.ts`

- [ ] **Step 1: 공개 경로별 활성 상태 실패 테스트를 추가한다.**

```ts
it("모집 공고와 지원 화면에서는 모집 안내가 활성이다", () => {
  expect(activeLabels("/projects/notice", GUEST)).toEqual(["모집 안내"])
  expect(activeLabels("/projects/apply/7", GUEST)).toEqual(["모집 안내"])
})

it("프로젝트 목록과 상세 화면에서는 프로젝트가 활성이다", () => {
  expect(activeLabels("/projects", GUEST)).toEqual(["프로젝트"])
  expect(activeLabels("/projects/49", GUEST)).toEqual(["프로젝트"])
})
```

- [ ] **Step 2: 공통 `/projects` prefix 충돌을 해결한다.**

```ts
export type NavItem = {
  label: string
  to: string
  disabled?: boolean
  activeBasePath?: string
  activeBasePaths?: string[]
  inactiveBasePaths?: string[]
}

function matchesBasePath(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(basePath + "/")
}

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.disabled) return false
  if (item.inactiveBasePaths?.some((base) => matchesBasePath(pathname, base))) {
    return false
  }

  const activeBasePaths = item.activeBasePaths ?? [
    item.activeBasePath ?? item.to,
  ]
  return activeBasePaths.some((base) => matchesBasePath(pathname, base))
}
```

항목은 다음처럼 구성한다.

```ts
{
  label: "모집 안내",
  to: "/projects/notice",
  activeBasePaths: ["/projects/notice", "/projects/apply"],
},
{
  label: "프로젝트",
  to: "/projects",
  inactiveBasePaths: ["/projects/notice", "/projects/apply"],
},
```

기존 루트 `/` placeholder와 비활성 모집 안내 항목을 제거한다.

- [ ] **Step 3: 네비게이션 테스트와 커밋을 실행한다.**

```bash
pnpm exec vitest run src/widgets/navigation/header/recruitingHeaderNav.test.ts
git add src/widgets/navigation/header/recruitingHeaderNav.ts src/widgets/navigation/header/recruitingHeaderNav.test.ts
git commit -m "fix: 모집 안내 네비게이션 활성 경로 정렬"
```

Expected: 모집 공고·지원 경로에서는 모집 안내만 활성이고 프로젝트 목록·상세에서는 프로젝트만 활성이다.

## Task 6: 모집 상태 CTA를 인증 상태와 피그마 상태에 맞게 분기

**Files:**

- Modify: `src/widgets/navigation/header/RecruitingHeader.tsx:42-83`
- Modify: `src/widgets/navigation/header/RecruitingStatusButton.tsx`
- Modify: `src/widgets/navigation/header/GuestProfileButton.tsx`

- [ ] **Step 1: 헤더 상태 행렬을 코드 기준으로 고정한다.**

| 인증   | 모집 상태 | 상태 CTA         | 우측 프로필 영역           |
| ------ | --------- | ---------------- | -------------------------- |
| 게스트 | open      | `지원하기` 링크  | 연한 청록 `로그인`         |
| 게스트 | closed    | 회색 `모집 마감` | 진한 청록/흰 글자 `로그인` |
| 로그인 | open      | `지원하기` 링크  | 프로필                     |
| 로그인 | closed    | 상태 CTA 숨김    | 프로필                     |

- [ ] **Step 2: 상태 버튼에 인증 여부를 전달하고 로그인 사용자의 마감 CTA를 숨긴다.**

```tsx
interface RecruitingStatusButtonProps {
  status: RecruitingStatus
  isAuthed: boolean
}

export function RecruitingStatusButton({
  status,
  isAuthed,
}: RecruitingStatusButtonProps) {
  if (status.phase === "closed") {
    if (isAuthed) return null
    return <span className={cn(BASE_CLASS, IDLE_CLASS)}>모집 마감</span>
  }

  return (
    <Link
      to="/projects/notice"
      className={cn(
        BASE_CLASS,
        "text-label-1-semibold bg-teal-600 text-white transition-colors hover:bg-teal-700",
      )}
    >
      지원하기
    </Link>
  )
}
```

헤더 호출부는 `<RecruitingStatusButton status={status} isAuthed={isAuthed} />`로 변경한다.

- [ ] **Step 3: 게스트 로그인 버튼의 마감 색상을 분기한다.**

```tsx
interface GuestProfileButtonProps {
  recruitingStatus?: RecruitingStatus
  className?: string
}

export function GuestProfileButton({
  recruitingStatus,
  className,
}: GuestProfileButtonProps) {
  const isClosed = recruitingStatus?.phase === "closed"

  return (
    <Link
      to="/login"
      className={cn(
        "text-label-1-semibold flex h-10 min-w-16 shrink-0 items-center justify-center rounded-[10px] px-5 text-center tracking-[-0.32px] transition-colors",
        isClosed
          ? "bg-teal-600 text-white hover:bg-teal-700"
          : "bg-teal-100 text-teal-600 hover:bg-teal-200",
        className,
      )}
    >
      로그인
    </Link>
  )
}
```

호출부는 `<GuestProfileButton recruitingStatus={status} />`로 변경한다.

- [ ] **Step 4: 상태 테스트와 브라우저 검증을 실행한다.**

```bash
pnpm exec vitest run src/features/recruiting/model/recruitingStatus.test.ts src/widgets/navigation/header/recruitingHeaderNav.test.ts
pnpm exec tsc --noEmit
```

개발 헤더 시나리오에서 게스트·중앙 핵심·학교 회장단·챌린저 각각의 open/closed를 확인한다. 피그마 헤더 node `3280:110402` 기준으로 상태 CTA 텍스트, 마감 로그인 색상, 로그인 사용자 마감 CTA 미노출을 확인한다.

- [ ] **Step 5: 헤더 상태 커밋을 만든다.**

```bash
git add src/widgets/navigation/header/RecruitingHeader.tsx src/widgets/navigation/header/RecruitingStatusButton.tsx src/widgets/navigation/header/GuestProfileButton.tsx
git commit -m "fix: 모집 상태와 인증별 헤더 CTA 정렬"
```

## Task 7: 프로필 아이콘을 공용 `ProfileAvatar`로 추출

**Files:**

- Create: `src/shared/ui/profile/ProfileAvatar.tsx`
- Test: `src/shared/ui/profile/ProfileAvatar.test.tsx`
- Modify: `src/widgets/navigation/header/Profile.tsx`
- Modify: `src/widgets/navigation/header/ProfileDropdown.tsx`

- [ ] **Step 1: 피그마 변형을 표현하는 컴포넌트 타입과 테스트를 정의한다.**

공용 컴포넌트의 API는 크기 `40 | 46 | 100`, 상태 `default | filled | hover-upload`, 이미지 fallback을 표현한다. 테스트는 세 크기의 width/height, 이미지 유무에 따른 fallback, hover-upload 아이콘 레이어를 확인한다.

```ts
type ProfileAvatarSize = 40 | 46 | 100
type ProfileAvatarState = "default" | "filled" | "hover-upload"
```

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ProfileAvatar } from "./ProfileAvatar"

describe("ProfileAvatar", () => {
  it("피그마 크기 변형을 적용한다", () => {
    const { container } = render(<ProfileAvatar size={46} />)
    expect(container.firstChild).toHaveStyle({
      width: "46px",
      height: "46px",
    })
  })

  it("이미지가 없으면 기본 프로필 아이콘을 표시한다", () => {
    const { container } = render(<ProfileAvatar />)
    expect(container.querySelector("svg")).toBeTruthy()
  })

  it("이미지가 있으면 이미지와 업로드 상태 레이어를 표시한다", () => {
    render(
      <ProfileAvatar
        src="https://example.com/profile.png"
        alt="사용자 프로필"
        state="hover-upload"
      />,
    )
    expect(screen.getByAltText("사용자 프로필")).toBeInTheDocument()
    expect(screen.getByTestId("profile-avatar-upload")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 최소 공용 표현 컴포넌트를 구현한다.**

```tsx
import CloudUploadIcon from "@/shared/assets/icon/upload/CloudUploadIcon"
import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import { cn } from "@/shared/lib/utils"

export type ProfileAvatarSize = 40 | 46 | 100
export type ProfileAvatarState = "default" | "filled" | "hover-upload"

interface ProfileAvatarProps {
  size?: ProfileAvatarSize
  src?: string | null
  alt?: string
  state?: ProfileAvatarState
  className?: string
}

export function ProfileAvatar({
  size = 40,
  src,
  alt = "프로필 이미지",
  state = src ? "filled" : "default",
  className,
}: ProfileAvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <ProfileIcon className="size-full" aria-hidden="true" />
      )}
      {state === "hover-upload" && (
        <span
          data-testid="profile-avatar-upload"
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-white"
        >
          <CloudUploadIcon className="size-5" aria-hidden="true" />
        </span>
      )}
    </span>
  )
}
```

- [ ] **Step 3: 헤더 프로필과 드롭다운의 중복 렌더링을 교체한다.**

`Profile.tsx`의 직접 `img/ProfileIcon` 분기를 `ProfileAvatar size={size}`로 바꾼다. `ProfileDropdown.tsx`의 46px 프로필 버튼 내부도 `ProfileAvatar size={46}`으로 바꾼다. 드롭다운의 이동·기수·로그아웃 책임은 기존 컴포넌트에 남긴다.

```tsx
<ProfileAvatar size={size} src={profileSrc} alt={me?.name ?? "프로필 이미지"} />
```

- [ ] **Step 4: 프로필 테스트와 타입 검사를 실행한다.**

```bash
pnpm exec vitest run src/shared/ui/profile/ProfileAvatar.test.tsx
pnpm exec eslint src/shared/ui/profile/ProfileAvatar.tsx src/widgets/navigation/header/Profile.tsx src/widgets/navigation/header/ProfileDropdown.tsx
pnpm exec tsc --noEmit
```

Expected: 피그마 profile node `3427:121347`의 기본·filled·upload와 40/46/100 크기 검증이 PASS한다.

- [ ] **Step 5: 프로필 공용화 커밋을 만든다.**

```bash
git add src/shared/ui/profile/ProfileAvatar.tsx src/shared/ui/profile/ProfileAvatar.test.tsx src/widgets/navigation/header/Profile.tsx src/widgets/navigation/header/ProfileDropdown.tsx
git commit -m "refactor: 프로필 아바타 공용 컴포넌트 추출"
```

## Task 8: 개발 전용 헤더 시나리오를 서버 역할 행렬로 확장

**Files:**

- Modify: `src/routes/test/recruiting-header.tsx`

- [ ] **Step 1: 테스트 시나리오의 잘못된 역할 매핑을 수정한다.**

현재 `admin`이 중앙 운영팀원, `operator`가 지부장으로 매핑되어 서버 권한과 반대되는 상태를 대표한다. 다음 시나리오를 사용한다.

```ts
type RoleScenario =
  | "centralCore"
  | "schoolLeadership"
  | "centralStaff"
  | "chapterPresident"
  | "challenger"
  | "guest"

const SCENARIO_ROLE_TYPE: Record<Exclude<RoleScenario, "guest">, RoleType> = {
  centralCore: "CENTRAL_PRESIDENT",
  schoolLeadership: "SCHOOL_PRESIDENT",
  centralStaff: "CENTRAL_OPERATING_TEAM_MEMBER",
  chapterPresident: "CHAPTER_PRESIDENT",
  challenger: "CHALLENGER",
}
```

- [ ] **Step 2: 역할별 기대 헤더를 확인한다.**

- 중앙 핵심: `리크루팅`, `설정` 노출
- 학교 회장단: `리크루팅`만 노출
- 중앙 운영팀원·지부장: 운영 탭 미노출
- 챌린저: 모집 종료 시 `데모데이 매칭` 노출
- 게스트: `지원하기` 또는 `모집 마감`, `로그인`

- [ ] **Step 3: 브라우저에서 피그마 주요 화면을 대조한다.**

```bash
pnpm dev --host 127.0.0.1 --port 5173
```

다음 경로를 확인한다.

- `/test/recruiting-header`: 6개 역할 × open/closed
- `/projects`: 게스트 프로젝트 탭 활성
- `/projects/notice`: 게스트 모집 안내 탭 활성
- `/projects/apply/7`: 모집 안내 탭 활성 및 익명 지원 UI
- `/recruiting/dashboard/applications`: 비로그인 리다이렉트, 허용 역할 진입
- `/manage/school`: 비로그인·비허용 역할 차단, 중앙 핵심 진입

피그마는 다음 노드를 읽기 전용으로 대조한다.

- 헤더 `3280:110402`
- 헤더 버튼 `3256:122480`
- 네비게이션 버튼 `3248:119501`
- 프로필 `3427:121347`

- [ ] **Step 4: 개발 시나리오 커밋을 만든다.**

```bash
git add src/routes/test/recruiting-header.tsx
git commit -m "test: 서버 역할별 헤더 시나리오 확장"
```

## Task 9: `/test/*` 개발 환경 전용 공통 가드 적용

**Files:**

- Create: `src/routes/test/route.tsx`
- Modify: `src/routeTree.gen.ts`
- Test: `pnpm build` 및 production preview 런타임 접근 차단

- [ ] **Step 1: 테스트 디렉터리 공통 부모 라우트를 추가한다.**

기존 테스트 페이지는 개발 환경에서 계속 사용하되, `src/routes/test/route.tsx`에서 모든 하위 경로를 감싼다. `import.meta.env.DEV`가 false인 production build에서는 `/`로 리다이렉트한다.

```tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/test")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw redirect({ to: "/" })
  },
  component: () => <Outlet />,
})
```

- [ ] **Step 2: 모든 `/test/*` 하위 경로가 공통 부모를 사용하는지 확인한다.**

```bash
pnpm build
rg -n "TestRouteRoute|Test.*Route.*getParentRoute.*TestRouteRoute" src/routeTree.gen.ts
```

Expected: `TestRouteRoute`가 생성되고 테스트 하위 라우트의 `getParentRoute`가 공통 테스트 부모를 가리키며 production build가 PASS한다. 테스트 라우트 모듈의 번들 포함 여부가 아니라 production에서의 런타임 접근 차단을 완료 기준으로 삼는다.

- [ ] **Step 3: production 빌드 가드와 개발 빌드 접근을 확인한다.**

개발 서버에서는 `/test/recruiting-header`와 기존 `/test/*` 페이지가 렌더링되어야 한다. production preview에서는 동일한 경로가 `/`로 이동해야 한다. 별도 빌드 제외 설정은 추가하지 않고 공통 부모 라우트의 `beforeLoad` 리다이렉트를 운영 접근 제한의 단일 기준으로 사용한다.

```bash
pnpm build
pnpm preview --host 127.0.0.1 --port 4173
```

Expected: production preview에서 `/test/recruiting-header` 접근 시 주소가 `/`로 바뀐다.

- [ ] **Step 4: 남은 데드 경로·미사용 export를 정적 검사한다.**

```bash
rg -n "disabled: true|activeBasePath|isRecruitingOperator|isCentralAdmin|ProfileAvatar" src
pnpm exec eslint src
pnpm exec tsc --noEmit
```

확인할 사항:

- 모집 안내가 루트 `/` placeholder를 사용하지 않는다.
- 역할 capability가 실제 라우트·헤더·테스트에서 사용된다.
- `ProfileAvatar`가 헤더와 드롭다운에서 사용된다.
- `/test/*`의 공통 개발 전용 가드가 `src/routes/test/route.tsx`에만 존재한다.

- [ ] **Step 5: 개발 전용 가드 커밋을 만든다.**

```bash
git add src/routes/test/route.tsx src/routeTree.gen.ts
git commit -m "fix: 테스트 라우트를 개발 환경으로 제한"
```

## Task 10: 단일 PR 최종 검증·푸시

**Files:**

- Verify: 현재 브랜치 전체 변경
- Do not stage automatically: `.claude/`, `.playwright-mcp/`, 기존 조사 문서 등 의도하지 않은 파일

- [ ] **Step 1: 서버 계약을 최신 develop 기준으로 재확인한다.**

```bash
git -C /Users/2sac/Documents/github/umc-product-server fetch origin develop
git -C /Users/2sac/Documents/github/umc-product-server rev-parse origin/develop
```

`/umc-api` 절차로 공개 모집·약관 API는 인증 없이 200, 관리자 모집 API는 인증 없이 401인지 확인한다. 서버 역할은 중앙 핵심·학교 회장단만 리크루팅, 중앙 핵심만 설정 쓰기로 기록한다.

- [ ] **Step 2: 전체 검증 명령을 실행한다.**

```bash
pnpm exec vitest run src/entities/member/model/identity.test.ts src/features/recruiting/api/recruitingApi.test.ts src/features/recruiting/model/applyDraftStorage.test.ts src/widgets/navigation/header/recruitingHeaderNav.test.ts src/shared/ui/profile/ProfileAvatar.test.tsx
pnpm test:run
pnpm exec eslint src
pnpm exec tsc --noEmit
pnpm build
git diff --check
```

Expected: 대상 테스트, 전체 테스트, ESLint, TypeScript, production build, whitespace 검사가 모두 PASS한다.

- [ ] **Step 3: PR에 포함할 파일만 확인한다.**

```bash
git status --short
git diff --stat origin/develop...HEAD
git diff --stat
```

`git add -A`를 사용하지 않고 작업 목록의 소스·테스트·생성 파일만 stage한다. 피그마 캡처, `.claude/`, 기존 문서 등 검증 산출물은 PR에 넣지 않는다.

- [ ] **Step 4: 현재 PR 브랜치에 push한다.**

```bash
git push origin feat/#688-header-role-branching
```

새 브랜치나 새 PR은 만들지 않는다. 기존 PR에 이번 커밋들이 포함되는지만 확인한다.

## 완료 기준

- 중앙 운영/교육팀원과 지부장이 `/recruiting` 및 `/manage` 메뉴·라우트에 진입하지 못한다.
- 중앙 핵심과 학교 회장단만 서버와 일치하는 리크루팅 메뉴를 본다.
- 중앙 핵심만 설정 메뉴를 본다.
- 게스트는 공개 지원 API와 공개 개인정보 약관 API를 사용하고, 로그인 사용자는 인증 API를 사용한다.
- 게스트의 “새로 시작”이 익명 세션 초안을 실제로 삭제한다.
- `/projects/notice`와 `/projects/apply/:roundId`에서 모집 안내가 활성이고 프로젝트와 동시에 활성화되지 않는다.
- 마감 헤더의 게스트 로그인 색상과 로그인 사용자 CTA가 피그마와 일치한다.
- 헤더 프로필과 드롭다운이 `ProfileAvatar`를 공유하고 40/46/100 크기와 상태를 표현한다.
- 테스트 라우트와 비활성 placeholder 경로가 운영 번들에 남지 않는다.
- 전체 테스트·린트·타입 검사·빌드가 통과한다.
