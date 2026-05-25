# QA 자동화 테스트 결과 보고서

**대상**: 프로젝트 등록 1단계 (기본 정보) - [다음] 버튼 유효성 검증  
**관련 이슈**: #106 (프로젝트 등록 토스트 팝업 에러 메세지 수정 요청)  
**테스트 일시**: 2026-05-24  
**테스트 환경**: 로컬 dev 서버 (http://localhost:5173), 계정 `schoolpresident@umc.it.kr` (SCHOOL_PRESIDENT 역할, isOperator=true)  
**테스트 도구**: Chrome DevTools MCP + window.\_\_toastLog MutationObserver

---

## 테스트 결과 요약

| #   | 케이스               | 입력 상태                              | 기대 메시지                             | 실제 메시지                             | 결과 |
| --- | -------------------- | -------------------------------------- | --------------------------------------- | --------------------------------------- | ---- |
| 1   | PM 미선택 (싱글)     | 모두 비움                              | PM을 선택해 주세요.                     | PM을 선택해 주세요.                     | PASS |
| 2   | PM2 미선택 (멀티)    | PM1만 선택, 멀티 PM 토글 ON            | 모든 PM을 선택해 주세요.                | 모든 PM을 선택해 주세요.                | PASS |
| 3   | 이름 미입력          | PM만 선택                              | 프로젝트 이름을 입력해 주세요.          | 프로젝트 이름을 입력해 주세요.          | PASS |
| 4   | 한 줄 소개 미입력    | PM + 이름                              | 프로젝트 한 줄 소개를 입력해 주세요.    | 프로젝트 한 줄 소개를 입력해 주세요.    | PASS |
| 5   | 대표 이미지 미업로드 | PM + 이름 + 소개                       | 프로젝트 대표 이미지를 업로드해 주세요. | 프로젝트 대표 이미지를 업로드해 주세요. | PASS |
| 6   | 로고 미업로드        | PM + 이름 + 소개 + 대표 이미지         | 프로젝트 로고를 업로드해 주세요.        | 프로젝트 로고를 업로드해 주세요.        | PASS |
| 7   | 복수 누락 우선순위   | 이름만 채움 (PM/소개/이미지/로고 없음) | PM을 선택해 주세요.                     | PM을 선택해 주세요.                     | PASS |

**전체: 7/7 PASS**

---

## 케이스별 상세

### Case 1 — PM 미선택 (싱글 PM 모드)

- **입력**: 모든 필드 비움
- **조작**: [다음] 클릭
- **기대**: "PM을 선택해 주세요."
- **결과**: PASS
- **검증 경로**: `handleFormSubmit` → `!pm1Member` 분기

### Case 2 — PM2 미선택 (멀티 PM 모드)

- **입력**: PM1 선택, "PM이 두 명 이상인가요?" 토글 ON, PM2 미선택
- **조작**: [다음] 클릭
- **기대**: "모든 PM을 선택해 주세요."
- **결과**: PASS
- **검증 경로**: `handleFormSubmit` → `isMultiPm && !pm2Member` 분기

### Case 3 — 이름 미입력

- **입력**: PM1 선택, 이름 비움
- **조작**: [다음] 클릭
- **기대**: "프로젝트 이름을 입력해 주세요."
- **결과**: PASS
- **검증 경로**: `onInvalid` → `fieldErrors.title` 분기
- **스크린샷**: case4-description-missing.png (Case 4 촬영 시 직전 케이스 상태 참고)

### Case 4 — 한 줄 소개 미입력

- **입력**: PM1 선택, 이름 입력, 소개 비움
- **조작**: [다음] 클릭
- **기대**: "프로젝트 한 줄 소개를 입력해 주세요."
- **결과**: PASS
- **검증 경로**: `onInvalid` → `fieldErrors.description` 분기
- **스크린샷**: case4-description-missing.png

### Case 5 — 대표 이미지 미업로드

- **입력**: PM1 선택, 이름 + 소개 입력, 썸네일 미업로드
- **조작**: [다음] 클릭
- **기대**: "프로젝트 대표 이미지를 업로드해 주세요."
- **결과**: PASS
- **검증 경로**: `onInvalid` → `!(values.thumbnail instanceof File) && !uploaded.thumbnailUrl` 분기
- **스크린샷**: case5-thumbnail-missing.png

### Case 6 — 로고 미업로드

- **입력**: PM1 선택, 이름 + 소개 + 대표 이미지 모두 입력/업로드, 로고 미업로드
- **조작**: [다음] 클릭
- **기대**: "프로젝트 로고를 업로드해 주세요."
- **결과**: PASS
- **검증 경로**: `onInvalid` → `!(values.logo instanceof File) && !uploaded.logoUrl` 분기
- **스크린샷**: case6-logo-missing.png

### Case 7 — 복수 누락 우선순위 검증

- **입력**: 이름만 "테스트 프로젝트" 입력 (PM 미선택, 소개/이미지/로고 모두 없음)
- **조작**: [다음] 클릭
- **기대**: "PM을 선택해 주세요." (PM 검증이 최우선)
- **결과**: PASS
- **검증 경로**: `handleFormSubmit` → PM 체크가 `handleSubmit(onSubmit, onInvalid)` 호출 전 선행 실행

---

## 검증된 우선순위

코드상 오류 우선순위가 QA 시나리오 명세와 일치함을 확인:

1. PM1 미선택 (`handleFormSubmit` 직접 체크)
2. PM2 미선택 멀티 PM 모드 (`handleFormSubmit` 직접 체크)
3. 이름(title) 누락 (`onInvalid` → Zod `fieldErrors.title`)
4. 한 줄 소개(description) 누락 (`onInvalid` → Zod `fieldErrors.description`)
5. 대표 이미지(thumbnail) 미업로드 (`onInvalid` → 파일 instanceof 체크)
6. 로고(logo) 미업로드 (`onInvalid` → 파일 instanceof 체크)

---

## 스코프 외 항목

- **QA 시나리오 Case 6 "문항 작성 미완료"**: 3단계(지원 문항 / ApplicationForm)의 [등록하기] 버튼 영역. 본 테스트 범위 외.

---

## 콘솔 에러

테스트 진행 중 별도의 콘솔 에러 없음.

---

## 결론

이슈 #106에서 지적된 토스트 메시지 오류가 현재 develop 브랜치에서 모두 수정된 상태임을 확인. 7개 케이스 전체 PASS.

---

---

# 프로젝트 CRUD 종합 QA 테스트 결과 보고서

- 테스트 일자: 2026-05-25
- 테스트 환경: localhost:5173 (Vite dev), API: dev.api.umc.it.kr
- 브랜치: fix/project-form-edit-mode-bugs
- 테스트 도구: Playwright MCP (Chrome headless)

---

## 테스트 계정 및 역할

| 계정                           | 역할                | 등록 페이지 접근     |
| ------------------------------ | ------------------- | -------------------- |
| superadmin@umc.it.kr           | Operator (운영진)   | 가능                 |
| chapterpresident@umc.it.kr     | Operator (지부장)   | 가능                 |
| schoolpresident@umc.it.kr      | Operator (학교회장) | 가능                 |
| planchallenger@umc.it.kr       | PM (현재 기수)      | 가능 (step 2 비활성) |
| webchallenger@umc.it.kr        | 일반 챌린저         | 불가 (리디렉트)      |
| springbootchallenger@umc.it.kr | 일반 챌린저         | 불가 (리디렉트)      |

---

## 공통 테스트 환경 제약

### S3 이미지 업로드 CORS 오류

- **현상**: Step 1 썸네일/로고 업로드 시 `net::ERR_FAILED`
- **원인**: `dev-umc-product-team-files-public.s3.ap-northeast-2.amazonaws.com` CORS 설정에 `http://localhost:5173` 미허용
- **영향**: 로컬에서 이미지 업로드를 포함한 완전한 Step 1 저장 불가, 정상 Flow로 Step 3 진입 불가
- **조치 필요**: S3 버킷 CORS 설정에 localhost 추가

---

## 계정별 테스트 결과

### 계정1 - superadmin@umc.it.kr (Operator)

| 항목                                        | 결과    | 비고                                 |
| ------------------------------------------- | ------- | ------------------------------------ |
| 로그인                                      | PASS    |                                      |
| 프로젝트 등록 페이지 접근                   | PASS    |                                      |
| Step 1 폼 렌더링                            | PASS    | PM 선택 필드 표시                    |
| Step 2 모집 정보 접근                       | PASS    | Operator는 step 2 편집 가능          |
| Step 3 지원 문항 접근                       | PASS    |                                      |
| 프로젝트 생성 (POST /projects)              | PASS    | ID 39 생성                           |
| 지원 문항 임시 저장 (PUT /application-form) | PASS    |                                      |
| 최종 등록 (POST /submit)                    | BLOCKED | S3 CORS로 이미지 없어 완전 검증 불가 |

### 계정4 - planchallenger@umc.it.kr (PM)

| 항목                                | 결과 | 비고                                                                               |
| ----------------------------------- | ---- | ---------------------------------------------------------------------------------- |
| 로그인                              | PASS |                                                                                    |
| 프로젝트 등록 페이지 접근           | PASS |                                                                                    |
| Step 2 비활성 확인                  | PASS | PM은 step 2 비활성, tooltip "기술 스택 및 파트별 TO는 운영진이 수기로 조정합니다." |
| 기존 프로젝트 삭제                  | PASS | 삭제 후 "등록된 프로젝트가 없습니다."                                              |
| 신규 프로젝트 생성                  | PASS | ID 60 생성 (POST /projects 200)                                                    |
| Step 3 - 텍스트 유형 문항           | PASS | Q1 정상 작성                                                                       |
| Step 3 - 단일 선택 유형 문항        | PASS | Q2, 옵션 3개 (디자인/프론트엔드/백엔드)                                            |
| Step 3 - 복수 선택 유형 문항        | PASS | Q3, 옵션 2개 (개인/팀 프로젝트)                                                    |
| Step 3 - 파일 업로드 유형 문항      | PASS | Q4 정상 작성                                                                       |
| Step 3 - 포트폴리오 유형 문항       | PASS | Q5 자동 기본 제목 적용                                                             |
| Design/Frontend/Backend 섹션 활성화 | PASS | 토글 3개 모두 ON                                                                   |
| 섹션별 Q1 제목 입력                 | PASS | 각 섹션 고유 제목 입력                                                             |
| 지원 문항 임시 저장                 | PASS | PUT /application-form 200, 모든 섹션 정상 저장 확인                                |
| 최종 등록 (POST /submit)            | FAIL | 서버 타임아웃 - 기본 정보(이름/이미지) null 상태로 인한 서버 처리 실패 추정        |

### 계정2 - chapterpresident@umc.it.kr (Operator, 지부장)

| 항목                      | 결과 | 비고                   |
| ------------------------- | ---- | ---------------------- |
| 로그인                    | PASS |                        |
| 프로젝트 등록 페이지 접근 | PASS |                        |
| Step 2 접근 가능          | PASS | aria-disabled=false    |
| Step 3 접근 가능          | PASS |                        |
| 폼 렌더링                 | PASS | PM 선택 필드 정상 표시 |

### 계정3 - schoolpresident@umc.it.kr (Operator, 학교회장)

| 항목                      | 결과 | 비고                |
| ------------------------- | ---- | ------------------- |
| 로그인                    | PASS |                     |
| 프로젝트 등록 페이지 접근 | PASS |                     |
| Step 2 접근 가능          | PASS | aria-disabled=false |

### 계정5 - webchallenger@umc.it.kr (일반 챌린저)

| 항목                           | 결과 | 비고                                                     |
| ------------------------------ | ---- | -------------------------------------------------------- |
| 로그인                         | PASS |                                                          |
| 프로젝트 등록 페이지 접근 차단 | PASS | `isCurrentTermPm` 미해당 → `/matching/projects` 리디렉트 |

### 계정6 - springbootchallenger@umc.it.kr (일반 챌린저)

| 항목                           | 결과 | 비고                                                     |
| ------------------------------ | ---- | -------------------------------------------------------- |
| 로그인                         | PASS |                                                          |
| 프로젝트 등록 페이지 접근 차단 | PASS | `isCurrentTermPm` 미해당 → `/matching/projects` 리디렉트 |

---

## 이번 세션에서 수정된 버그

### BUG-FIX-01: PUT /application-form 요청 시 sectionId 누락 (수정 완료)

- **파일**: `src/features/project/new/api/adapters.ts`
- **증상**: 편집 모드에서 지원 문항 저장 시 기존 섹션 ID를 미전송 → 서버에서 중복 섹션 생성
- **수정**: `buildUpsertApplicationFormBody`에서 `sectionId` 포함

### BUG-FIX-02: 편집 모드 완료 후 이탈 모달 오작동 (수정 완료)

- **파일**: `src/features/project/new/ui/application/ApplicationForm.tsx`
- **증상**: 수정 완료 후 성공 모달에서 "확인" 클릭 시 이탈 차단 모달이 추가로 표시됨
- **원인**: hydration 완료 전 스냅샷 초기화 타이밍 문제로 `isDirty=true` 오판단
- **수정**: `hasSavedOnce` 초기값 `isEditMode`로 변경, hydration 완료 시점에 스냅샷 초기화

---

## 발견된 신규 버그

### BUG-01: 운영진 관리 페이지 Mock 데이터 사용으로 삭제 기능 오동작 (High)

- **파일**: `src/features/project/management/ui/ProjectManagementPage.tsx`
- **증상**: Operator 계정의 프로젝트 관리 페이지가 실제 API 대신 `MOCK_MATCHING_PROJECTS` 사용
- **결과**: 삭제 클릭 시 `DELETE /projects/NaN` (Mock ID `"mock-matching-1"` → `Number()` → NaN)
- **조치**: 운영진용 프로젝트 목록 API 연동 필요

### BUG-02: 기본 정보 누락 상태의 프로젝트 submit 서버 타임아웃 (Medium)

- **현상**: 이름/이미지가 null인 프로젝트에 `POST /projects/{id}/submit` 시 10초 타임아웃 발생, 에러 응답 없음
- **재현 조건**: S3 CORS 오류로 이미지 미업로드 상태에서 submit 시도
- **조치**: 서버 측 null 체크 및 400 응답 처리 또는 클라이언트 측 사전 검증 필요

---

## 접근 제어 검증 요약

| 역할                 | 등록 페이지  | Step 1 | Step 2                   | Step 3 |
| -------------------- | ------------ | ------ | ------------------------ | ------ |
| Operator             | O            | O      | O (편집 가능)            | O      |
| PM (isCurrentTermPm) | O            | O      | X (비활성, tooltip 안내) | O      |
| 일반 챌린저          | X (리디렉트) | -      | -                        | -      |

---

## 종합 결론

- **Step 1→3 지원 문항 작성 및 임시 저장**: PASS
- **편집 모드 (수정 후 저장)**: PASS (이번 세션 버그 수정 후)
- **프로젝트 삭제 (PM)**: PASS
- **프로젝트 삭제 (Operator)**: FAIL (Mock 데이터로 인한 NaN 오류)
- **최종 등록 submit**: S3 CORS 제약으로 완전 검증 불가, 서버 타임아웃 이슈 확인됨
- **권한 제어**: PASS (일반 챌린저 접근 차단 정상 동작)
