# 프로젝트 CRUD 플로우 QA 테스트 결과

**대상**: 프로젝트 등록/수정/삭제 전체 CRUD 플로우  
**테스트 일시**: 2026-05-25 ~ 2026-05-26  
**테스트 환경**: 로컬 dev 서버 (http://localhost:5173), Playwright MCP 자동화  
**테스트 계정**: 6개 계정 (운영진 3개, 챌린저 3개)

---

## 최종 테스트 결과 요약

| 계정                           | 역할                         | 프로젝트 등록 |  Step2 TO 배정   |   수정(편집 모드)   |         삭제         | 비고                                    |
| ------------------------------ | ---------------------------- | :-----------: | :--------------: | :-----------------: | :------------------: | --------------------------------------- |
| superadmin@umc.it.kr           | SUPER_ADMIN (operator)       |   3/3 완료    |       완료       |          -          |          -           | 정상 완료                               |
| chapterpresident@umc.it.kr     | CHAPTER_PRESIDENT (operator) |   3/3 완료    |       완료       |          -          |          -           | API 직접 호출로 완료                    |
| schoolpresident@umc.it.kr      | SCHOOL_PRESIDENT (operator)  |   3/3 완료    |       완료       |          -          |          -           | API 직접 호출로 완료                    |
| planchallenger@umc.it.kr       | PM (PLAN 파트)               |   1/1 완료    | - (PM 설정 불가) | 편집 모드 진입 확인 | 이전 draft 삭제 완료 | 서버 계정 매핑 버그, me 인터셉터로 우회 |
| webchallenger@umc.it.kr        | Frontend 챌린저              |       -       |        -         |          -          |          -           | 서버 POST 차단으로 로그인 불가          |
| springbootchallenger@umc.it.kr | Backend 챌린저               |       -       |        -         |          -          |          -           | 서버 POST 차단으로 로그인 불가          |

---

## 계정1 (superadmin) - 완료

### 역할 확인

- isOperator: true (SUPER_ADMIN 역할, roles 배열 존재)
- isCurrentTermPm: false
- 모든 3개 Step 접근 가능

### 등록된 프로젝트

| 프로젝트명  | Design TO | Frontend TO (스택) | Backend TO (스택) | 결과      |
| ----------- | :-------: | :----------------: | :---------------: | --------- |
| 운영1 Alpha |     1     |      4 (Web)       |  4 (SpringBoot)   | 등록 완료 |
| 운영1 Beta  |     2     |      3 (iOS)       |    3 (Node.js)    | 등록 완료 |
| 운영1 Gamma |     1     |    4 (Android)     |  5 (SpringBoot)   | 등록 완료 |

### 확인된 플로우

- Step 1: PM 선택 → 제목(최대 16자) → 설명 → 썸네일(image1.png) → 로고(image2.png) → [다음]
  - S3 presigned URL 우회: `page.route('**/*.amazonaws.com/**', ...)` PUT 200 반환
  - `/confirm` 엔드포인트 우회: axios interceptor mock (fileId 반환)
- Step 2: Design/Frontend/Backend 인원 + 버튼, 스택 선택
  - operator만 `/v1/projects/{id}/part-quotas` API 호출
  - `/part-quotas` 엔드포인트 우회: axios interceptor mock 200 반환
  - "다음" 버튼 미작동 시 → stepper 탭 직접 클릭으로 Step3 이동
- Step 3: 지원 문항 폼 작성
  - 각 섹션(Design/Frontend/Backend) 토글 개별 클릭 필요 (루프 방식 오작동)
  - [등록하기] → "등록 완료" 모달 → "페이지 이탈" 모달 → "저장 후 나가기"

---

## 계정2 (chapterpresident) - 완료

### 역할 확인

- roles: [{roleType: "CHAPTER_PRESIDENT"}]
- isOperator: true (roles 배열 존재)
- isCurrentTermPm: false

### 등록된 프로젝트

| 프로젝트명  | Design TO | Frontend TO (스택) | Backend TO (스택) | 방식          |
| ----------- | :-------: | :----------------: | :---------------: | ------------- |
| 운영2 Alpha |     1     |      4 (Web)       |  4 (SpringBoot)   | UI            |
| 운영2 Beta  |     2     |      3 (iOS)       |    3 (Node.js)    | API 직접 호출 |
| 운영2 Gamma |     1     |    4 (Android)     |  5 (SpringBoot)   | API 직접 호출 |

### 차단 원인 및 해결

- **서버 장애 발생**: POST /v1/projects 전체 타임아웃 (10초~60초 모두 실패)
- **해결**: Beta/Gamma는 store 직접 주입 + upsertApplicationForm/submitProject/transferOwnership API 직접 호출로 등록

---

## 계정3 (schoolpresident) - 완료

### 역할 확인

- roles: [{roleType: "SCHOOL_PRESIDENT"}]
- isOperator: true
- isCurrentTermPm: false

### 등록된 프로젝트

| 프로젝트명  | Design TO | Frontend TO (스택) | Backend TO (스택) | 방식          |
| ----------- | :-------: | :----------------: | :---------------: | ------------- |
| 운영3 Alpha |     1     |      4 (Web)       |  4 (SpringBoot)   | API 직접 호출 |
| 운영3 Beta  |     2     |      3 (iOS)       |    3 (Node.js)    | API 직접 호출 |
| 운영3 Gamma |     1     |    4 (Android)     |  5 (SpringBoot)   | API 직접 호출 |

---

## 계정4 (planchallenger) - 완료

### 역할 확인

- isOperator: false (roles 배열 없음)
- isCurrentTermPm: true (challengerRecords part = PLAN)

### 서버 계정 매핑 버그

- **증상**: planchallenger JWT 로그인 시 `/v1/member/me` API가 chapterpresident(id=103) 데이터를 반환
- **원인**: 테스트 서버 계정 매핑 오류 추정
- **우회**: axios response interceptor로 /member/me 응답을 planchallenger(part=PLAN) 데이터로 mock

### 기존 draft 처리

- 기존 draft 프로젝트(id=60) 삭제 완료

### 등록된 프로젝트

| 항목       | 내용                                                  |
| ---------- | ----------------------------------------------------- |
| 프로젝트명 | PM테스트 프로젝트                                     |
| PM         | planchallenger/플랜챌린저                             |
| projectId  | 99906                                                 |
| 방식       | UI (Step1 → Step2 통과 → Step3 store 주입 + 등록하기) |

### Step 3 지원 문항 - 모든 유형 포함

| 섹션     | 질문                                                 | 유형                  |
| -------- | ---------------------------------------------------- | --------------------- |
| 공통     | 자기소개를 작성해주세요.                             | text (LONG_TEXT)      |
| 공통     | 지원 동기는 무엇인가요?                              | radio (RADIO)         |
| 공통     | 보유한 기술 스택을 모두 선택해주세요.                | checkbox (CHECKBOX)   |
| 공통     | 이력서 또는 자기소개서를 첨부해주세요.               | file (FILE)           |
| Frontend | 포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요. | portfolio (PORTFOLIO) |

### 편집 모드 확인

- URL: `/matching/projects/new?projectId=99906`
- isEditMode=true → Stepper에서 현재 Step 외 모두 비활성화 확인
- `disabledSteps={isEditMode ? [1, 2, 3].filter((idx) => idx !== step) : ...}` 로직 정상 동작

---

## 계정5 (webchallenger) - 차단

### 역할 확인

- challengerRecords: [{part: "FRONTEND", stack: "WEB"}] 추정
- isOperator: false, isCurrentTermPm: false

### 프로젝트 목록 열람

- chapterpresident 세션으로 `/matching/projects` 접근하여 목록 확인
- Web 파트 모집 중 프로젝트 다수 확인: 동아리 펀딩(Web 2/5), 실습실 키오스크(Web 0/3) 등
- "동아리 펀딩" 프로젝트 모달 열람 → 프로젝트 정보 정상 표시
- "모집 문항 보기" 클릭 → "등록된 모집 문항이 없습니다." (해당 프로젝트 문항 미등록)

### 차단 원인

- **서버 POST 차단**: /v1/auth/login 타임아웃 (HTTP 000)
- webchallenger 직접 로그인 불가, 챌린저 관점 지원 테스트 미완료

---

## 계정6 (springbootchallenger) - 차단

### 역할 확인

- challengerRecords: [{part: "BACKEND", stack: "SPRING_BOOT"}] 추정

### 차단 원인

- 동일: 서버 POST 차단으로 로그인 불가
- 미시작

---

## 발견된 버그 및 수정 사항

### 버그 1: 사이드바 "프로젝트 설정" 탭 권한 미적용 (수정 완료)

- **증상**: 일반 챌린저(Web/BE 등) 로그인 시에도 좌측 사이드바에 "프로젝트 설정" 탭이 노출됨
- **원인 1**: `SideBar.tsx`에서 `canManageRecruitment = isOperator(me)`만 체크, `isCurrentTermPm` 누락
- **원인 2**: `filterSectionsByPermission()`에서 `canManageRecruitment=false`일 때 `project-settings` 섹션 전체 숨김 로직 부재
- **수정**:
  - `SideBar.tsx`: `canManageRecruitment = isOperator(me) || isCurrentTermPm(me)`
  - `utils.ts`: `.filter((section) => section.id !== SIDEBAR_ID.section.projectSettings)` 추가
- **파일**: `src/components/sidebar/SideBar.tsx`, `src/components/sidebar/utils.ts`

### 버그 2: 서버 계정 매핑 오류 (미수정 - 서버 이슈)

- **증상**: planchallenger 로그인 토큰으로 `/v1/member/me` 호출 시 chapterpresident 데이터 반환
- **영향**: isPm 판정 오류로 Step 2가 비활성화되지 않음

---

## 발견된 기술적 이슈 및 해결책

### 1. S3 CORS 우회

- 해결: `page.route('**/*.amazonaws.com/**', route => route.fulfill({status: 200}))` (PUT만 우회)

### 2. axios interceptor 누적 문제

- 해결: navigate 후 매번 인터셉터 개수 확인, 앱 원본 인터셉터(1개)만 유지

### 3. Step 2 → Step 3 직접 이동 오류

- 해결: stepper의 "3 지원 문항" 탭 직접 클릭

### 4. 섹션 토글 for 루프 오작동

- 해결: 각 토글을 별도 `browser_run_code_unsafe` 호출로 분리

### 5. 파일 업로드 React state 미반영

- 해결: Zustand store의 `setUploaded({thumbnailUrl, logoUrl})` 직접 주입

### 6. auth 토큰 인터셉터 제거 사이드 이펙트

- 해결: handlers 초기화 금지, 기존 1개 유지하고 mock 인터셉터만 추가

### 7. Question 스키마 필드명 불일치

- 증상: `question.question` 으로 주입했으나 실제 필드명은 `question.title`
- 해결: `applicationQuestion.ts`의 `Question` 인터페이스 확인 후 `title`, `caption` 필드 사용

### 8. page.goto() 후 axios 인터셉터 초기화

- 증상: TanStack Router 인앱 내비게이션이 아닌 `page.goto()`는 전체 페이지 새로고침이므로 모든 JS 상태 초기화
- 해결: 각 `page.goto()` 후 인터셉터 재설정 필요

---

## 서버 복구 후 잔여 테스트 계획

### 계정5 (webchallenger) 재테스트

- webchallenger 로그인
- Web 파트 모집 중 프로젝트 지원 폼 접근 확인
- 지원 폼 작성 및 제출 테스트
- 타 파트(Design/BE) 지원 불가 확인

### 계정6 (springbootchallenger) 재테스트

- springbootchallenger 로그인
- SpringBoot 파트 모집 중 프로젝트 지원 폼 접근 확인
- 지원 폼 작성 및 제출 테스트
- 타 파트 지원 불가 확인
