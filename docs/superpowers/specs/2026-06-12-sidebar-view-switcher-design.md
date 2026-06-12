# 사이드바 역할/파트 뷰 스위처 설계

작성일: 2026-06-12
대상 브랜치: `feat/responsive-navigation`
관련 컴포넌트: 사이드바, 권한(identity) 시스템, 매칭 라우트 가드

## Context

UMC 사용자는 한 계정에 **여러 권한/파트**를 동시에 가질 수 있다. 예를 들어 중앙 운영진이면서 WEB 챌린저이거나, 챕터 회장이면서 특정 기수의 PLAN(PM) 챌린저일 수 있다. 현재 권한 판정은 `identity` 함수들이 `me`(특히 `challengerRecords`의 최신 기수 `latestRecord`)를 한꺼번에 보고 OR 조합으로 계산하기 때문에, 다중 자격 사용자는 자신이 가진 모든 권한이 한 화면에 섞여 노출된다. 어떤 정체성으로 화면을 볼지 사용자가 선택할 수 없다.

이번 작업은 두 가지를 해결한다.

1. **(메인) 역할/파트 뷰 스위처**: 사이드바 상단에 드롭다운을 두어, 다중 자격 사용자가 "Admin View / Challenger-Plan View / Challenger-Others View" 중 하나를 선택하면 그 정체성에 허용된 사이드바·라우트·권한만 사용하도록 한다.
2. **(부수) 학교 운영진 지원현황 숨김**: 학교 운영진(회장/부회장/파트장/기타)에게 '지원 현황' 메뉴를 숨기고 라우팅을 차단한다. 단 동시에 현재 기수 PM인 경우는 노출/허용한다.

뷰 스위처를 `viewMe` 파생 방식으로 구현하면 (2)는 별도 분기 없이 자동 흡수된다.

## 요구사항 / 확정 결정사항

- 드롭다운 옵션은 `admin | pm | others` 3종 (기존 `useViewModeStore`의 `VIEW_MODE_OPTIONS`, 디자인 시안과 일치).
- **선택 가능한 뷰가 2개 이상인 사용자에게만 드롭다운을 노출**한다. 1개면 드롭다운을 숨기고 그 mode로 고정한다.
- 선택한 뷰는 **사이드바 메뉴 + 라우트 접근 + 페이지 내 권한 전부**를 제어한다(전면 전환).
- 기본 뷰 우선순위: `admin > pm > others` 중 가용한 첫째.
- 선택 상태는 **`sessionStorage`(zustand persist)** 에 저장 — 새로고침 유지, 탭 종료 시 리셋.
- **정체성 표시**(프로필 이름/아바타/역할칩)는 실제 `me` 유지. mode는 네비게이션/권한 게이팅에만 적용.

## 아키텍처: `viewMe` 파생

핵심 아이디어: 선택된 `mode`에 따라 `me`에서 **활성 정체성에 해당하는 부분만 남긴 `viewMe`** 를 만들고, 기존 `identity` 함수에 `me` 대신 `viewMe`를 넘긴다. `identity` 함수 시그니처는 바뀌지 않으며, 모든 권한 판정 로직이 재사용된다.

```
me ──(selected mode)──> projectViewMe(me, mode) ──> viewMe ──> 기존 identity 함수들
```

### `projectViewMe(me, mode)` 매핑 규칙

`src/shared/view-mode/projectViewMe.ts` (신규)

| mode     | roles       | challengerRecords        | 결과                                                                                               |
| -------- | ----------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| `admin`  | 유지        | `[]` (비움)              | 운영 roles만 활성 → `isOperator`/`isSchoolStaff` 등이 roles 기반으로 판정, `isCurrentTermPm=false` |
| `pm`     | `[]` (비움) | `part === "PLAN"` 기록만 | PLAN 정체성만 활성 → `isCurrentTermPm=true`, 운영 권한 없음                                        |
| `others` | `[]` (비움) | `part !== "PLAN"` 기록만 | 비-PLAN 챌린저 정체성만 활성 → 운영·PM 권한 모두 없음                                              |

`latestRecord`(gisuId 내림차순 첫째)에 의존하는 모든 함수(`isCurrentTermPm`, `getViewerBranch`, `getProjectPmSearchScope`의 fallback 등)는 좁혀진 `challengerRecords` 안에서 동작하므로, 선택한 정체성 기준으로 일관되게 계산된다.

설계 의도상 `pm` 뷰는 "내 PLAN 자격으로 보기"이므로, 여러 기수에 PLAN 기록이 있으면 그중 최신 기수 PLAN이 활성된다.

## 모듈 / 컴포넌트

### 1. `useViewModeStore` 정리 (`src/shared/view-mode/index.ts`)

- `mode`만 유지하고 **`previewMode`, `viewerBranch` 제거**(미사용 임시 필드).
- `persist` 미들웨어 추가, storage는 `sessionStorage`.
- 옵션/라벨(`VIEW_MODE_OPTIONS`, `indexFromMode`)은 유지.
- 기존 소비처 `useMatchingStatusData.ts`(`s.mode`)는 그대로 동작.

### 2. `projectViewMe(me, mode)` (`src/shared/view-mode/projectViewMe.ts`, 신규)

- 위 매핑 규칙을 순수 함수로 구현. `me`가 `undefined`면 `undefined` 반환.

### 3. `useViewMe()` (`src/shared/view-mode/useViewMe.ts`, 신규)

- `useMe()` + `useViewModeStore((s) => s.mode)` 조합 → `projectViewMe(me, mode)` 반환.
- 권한 게이팅이 필요한 컴포넌트가 `useMe` 대신 사용.

### 4. `useAvailableViewModes(me)` (`src/shared/view-mode/useAvailableViewModes.ts`, 신규)

- 가용 옵션 계산:
  - `admin` 가용 = `isAnyOperator(me)` (중앙/챕터/**학교 포함**)
  - `pm` 가용 = `challengerRecords`에 `part === "PLAN"` 기록 존재
  - `others` 가용 = `challengerRecords`에 `part !== "PLAN"` 기록 존재
- 반환: 가용 mode 목록(우선순위 순) + 기본 mode.
- 마운트 시 현재 `mode`가 가용 목록에 없으면 기본 mode로 보정.

### 5. `SideBarViewSwitcher` (`src/components/sidebar/SideBarViewSwitcher.tsx`, 신규)

- 사이드바 최상단 드롭다운 UI. `src/shared/ui/dropdown/`의 `DropdownItem` 등 재사용.
- 가용 옵션 ≥2일 때만 렌더, 1개면 `null`.
- 선택 시 `setModeByIndex` 호출 + 전환 네비게이션(아래) 수행.
- `SideBar.tsx`와 `MobileSidebarDrawerContent.tsx` 양쪽 상단에 배치(반응형).

### 6. 권한 소비처 교체

- `useVisibleSidebarSections`: `useMe` → `useViewMe`.
- 페이지 내 권한 분기 컴포넌트(아래 "적용 범위" 목록): `useMe` → `useViewMe`.
- 라우트 가드: `ensureMe` 후 `projectViewMe(me, mode)`로 판정.

## 적용 범위 (전면 전환)

`viewMe` 기반으로 전환할 대상(탐색에서 확인된 `identity` 소비처):

**라우트 가드** (`beforeLoad`에서 `ensureMe` 후 `projectViewMe(me, store.getState().mode)`로 판정):

- `src/routes/matching/rounds.tsx`, `applications.tsx`, `notice-publish.tsx`, `index.tsx`
- `src/routes/matching/projects/management.tsx`, `new.tsx`, `announce/index.tsx`, `announce/notice-publish.tsx`
- `src/routes/admin/route.tsx`
- (`/` 진입 분기 `src/routes/index.tsx`는 신원 기준 유지 검토 — 아래 리스크 참조)

**페이지 내 권한 분기** (`useMe` → `useViewMe`):

- `src/features/project/management/ui/ProjectManagementPage.tsx`
- `src/features/project/list/ui/ProjectDetailCard.tsx`, `model/matchingProjectList.ts`
- `src/features/project/new/ui/basic-info/BasicInfoForm.tsx`
- `src/routes/matching/applications.tsx`, `index.tsx`, `projects/announce/index.tsx` (컴포넌트 분기 부분)

**신원 표시 — `me` 유지 (전환 제외)**:

- `src/shared/ui/ProfileDropdown.tsx` (이름/아바타/역할칩, 기수 변경 영역)
- `src/components/header/Header.tsx`의 프로필/문의 등 신원 영역
- 단, 헤더 상단 네비게이션 항목(`navItems` — MANAGE/SYSTEM 탭)은 **권한 게이팅이므로 `useViewMe` 적용**.

## 상태 저장 & 전환 네비게이션

- 저장: `sessionStorage`(zustand `persist`). 라우트 가드 `beforeLoad`는 `useViewModeStore.getState().mode`로 동기 접근(sessionStorage hydration은 동기적).
- mode 전환 시: 새 `viewMe` 기준으로 `useVisibleSidebarSections` 결과를 계산하여, **현재 경로가 새 뷰의 사이드바 메뉴에 없으면(= 해당 라우트 가드에서도 차단될 경로) 해당 뷰의 첫 가용 메뉴(`to`)로 `navigate`**. 새 뷰에서도 노출되는 경로면 그대로 유지.

## 작업1 (학교 운영진 지원현황) — 자동 흡수 + 명시 필터

- 학교 운영진이 `admin` 뷰일 때 `viewMe.roles`는 학교 역할만 → `isOperator(viewMe)=false`. 지원현황 라우트 가드(`!isOperator && !isCurrentTermPm → redirect`)가 이미 차단.
- 학교 운영진 + 현재 기수 PM은 `pm` 뷰에서 `isCurrentTermPm(viewMe)=true` → 노출/허용.
- 사이드바 메뉴 숨김은 명시적으로 추가: `filterSectionsByPermission`에 `canViewApplications` 플래그를 더해 `matching-applications` 메뉴를 필터. `useVisibleSidebarSections`에서 `canViewApplications = isOperator(viewMe) || isCurrentTermPm(viewMe)`.

## 엣지케이스 & 리스크

- **Resource Permission API 마이그레이션 충돌**: `fix/matching-projects-new`에서 매칭 액션 권한(승인/관리 버튼)을 Resource Permission API 기반으로 전환 중. 페이지 내 권한 훅이 `me` 대신 `viewMe`(의 `challengerId`/`roles`)를 입력으로 받도록 조정 필요. 구현 시 해당 영역 우선 점검.
- **드롭다운 위치 제약**: 드롭다운은 매칭 레이아웃(사이드바)에만 존재. `pm`/`others` 뷰로 전환 후 매칭 영역을 벗어나면 mode를 되돌릴 UI가 없을 수 있음. 1차 범위는 사이드바 배치로 한정하고, 필요 시 헤더 프로필 영역에도 노출하는 것을 후속으로 검토.
- **`/` 진입 분기**: `src/routes/index.tsx`는 로그인 직후 첫 진입 라우팅을 신원 기준으로 결정. mode가 아직 기본값일 때 동작하므로 신원 기준 유지를 기본으로 하되 구현 시 확인.

## 테스트 계획

- 단위: `projectViewMe` 매핑(3 mode × 다중 기록 조합), `useAvailableViewModes` 가용성/기본값, `filterSectionsByPermission`의 `canViewApplications` 분기.
- E2E(Playwright): 테스트 계정 `xenon_chapterpresident@university.neordinary.com`(챕터 회장 + 챌린저 기록 다중 자격)으로
  - 드롭다운 노출(≥2 옵션) 확인,
  - `admin` 뷰: 운영 메뉴/지원현황 노출, `others` 뷰: 운영 메뉴 숨김·라우트 차단 확인,
  - 학교 운영진(있으면 별도 계정/시드)으로 지원현황 숨김 확인,
  - mode 전환 시 비허용 경로에서 기본 메뉴로 이동 확인.

## 비범위 (YAGNI)

- mode별 별도 기수 선택(드롭다운에 기수 분기) — 옵션은 역할 유형 3종으로 한정.
- 헤더 프로필 영역의 기수 변경(`GenerationListItem`) 실제 구현 — 본 작업 범위 밖.
- Resource Permission API 자체 마이그레이션 — 별도 작업.
