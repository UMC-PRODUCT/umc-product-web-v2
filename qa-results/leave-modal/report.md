# 페이지 이탈 모달 QA 결과 보고서

**이슈**: #112 — 프로젝트 등록 중 페이지 이탈 모달  
**테스트 일시**: 2026-05-24  
**테스트 환경**: 로컬 dev 서버 (http://localhost:5173), 계정 `schoolpresident@umc.it.kr` (SCHOOL_PRESIDENT, isOperator=true)  
**코드 변경 브랜치**: `fix/basic-info-save-skip-no-change`

---

## 코드 변경 내용

### 1. `src/routes/matching/projects/new.tsx`

**이탈 모달 텍스트 및 버튼 레이블 수정**

```diff
- content={
-   <>
-     작성 중인 내용이 저장되지 않습니다.
-     <br />
-     나가시겠습니까?
-   </>
- }
- confirmText="나가기"
- onConfirm={() => proceedLeave?.()}
+ confirmText="저장 후 나가기"
+ onConfirm={() => void handleSaveAndLeave()}
```

**`handleSaveAndLeave` 함수 추가**

```ts
const handleSaveAndLeave = async () => {
  if (step === 1) {
    const ok = await basicInfoRef.current?.save()
    if (!ok) return
  }
  proceedLeave?.()
}
```

- step 1: `BasicInfoForm.save()` → 실패 시 이탈 차단, 성공 시 `proceedLeave()` 호출
- step 2/3: 기본 정보는 이미 저장 완료된 상태이므로 바로 `proceedLeave()` 호출

### 2. `src/features/project/new/ui/basic-info/BasicInfoForm.tsx`

**`BasicInfoFormHandle`에 `save()` 추가**

```ts
export interface BasicInfoFormHandle {
  validate: () => Promise<boolean>
  save: () => Promise<boolean>    // 추가
}

useImperativeHandle(ref, () => ({
  validate: async () => { ... },
  save: () => handleTempSave({ silent: false }),  // 추가
}))
```

---

## 자동 테스트 결과

| #   | 케이스                                                         | 기대 결과                                                                                                          | 실제 결과                                                    | 판정     |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1   | 사이드 링크 클릭 → 이탈 모달 노출                              | 제목 "페이지 이탈", 내용 "저장되지 않았습니다. 저장 후 나가시겠습니까?", 버튼 [돌아가기] [저장 후 나가기], 딤 처리 | 동일                                                         | **PASS** |
| 2   | [돌아가기] 클릭                                                | 모달 닫힘, URL 유지, 폼 데이터 유지                                                                                | 모달 닫힘, URL `/matching/projects/new` 유지, 폼 데이터 유지 | **PASS** |
| 3   | [저장 후 나가기] — PM 미선택                                   | 임시저장 실패, 토스트 "PM을 선택한 뒤 임시 저장해 주세요.", 모달 유지, 이동 없음                                   | 토스트 캡처 확인, 모달 유지, URL 유지                        | **PASS** |
| 4   | [저장 후 나가기] — PM 선택 후 임시저장 성공 → 이탈 경로로 이동 | POST/PATCH 성공 → 의도 경로로 이동                                                                                 | CORS 차단으로 POST 불가                                      | **SKIP** |

---

## 케이스별 상세

### TC1 — 이탈 모달 노출

- **조작**: 프로젝트 등록 중 사이드 메뉴 "공지" 링크 클릭
- **검증 경로**: `isStoreDirty=true` → TanStack `useBlocker` 발동 → `leaveBlockStatus="blocked"` → `CtaModal` 노출
- **확인 항목**:
  - 화면 전체 딤 처리: ✓
  - 모달 정중앙 노출: ✓
  - 제목: "페이지 이탈" ✓
  - 내용: "저장되지 않았습니다. 저장 후 나가시겠습니까?" ✓
  - [돌아가기] 버튼: ✓
  - [저장 후 나가기] 버튼: ✓
- **스크린샷**: `02-modal-appears.png`

### TC2 — [돌아가기] 클릭

- **조작**: 모달에서 [돌아가기] 클릭
- **검증 경로**: `onCancel → resetLeave?.()` → blocker reset → 모달 닫힘
- **확인 항목**:
  - 모달 닫힘: `document.querySelector('[role="dialog"]') === null` ✓
  - URL 유지: `http://localhost:5173/matching/projects/new` ✓
  - 폼 데이터 유지: title "테스트 프로젝트", description "테스트 소개 문구입니다." 그대로 ✓
- **스크린샷**: `03-after-go-back.png`

### TC3 — [저장 후 나가기] PM 미선택 가드

- **사전 조건**: PM 미선택 상태
- **조작**: 모달에서 [저장 후 나가기] 클릭
- **검증 경로**: `handleSaveAndLeave` → `basicInfoRef.current.save()` → `handleTempSave()` → PM 없음 → 토스트 + return false → `proceedLeave()` 미호출
- **확인 항목**:
  - 토스트: "PM을 선택한 뒤 임시 저장해 주세요." (window.\_\_toastLog 캡처) ✓
  - 모달 유지: `document.querySelector('[role="dialog"]') !== null` ✓
  - URL 유지: `/matching/projects/new` ✓
- **스크린샷**: `04-save-fail-pm-not-selected.png`

### TC4 — [저장 후 나가기] 임시저장 성공 → 이탈 경로 이동

- **건너뜀 사유**: 로컬 dev 서버에서 `POST /api/v1/projects` CORS 차단 (`net::ERR_ABORTED`)
- **수동 검증 방법** (서버/VPN 환경):
  1. PM 선택 → [임시 저장] 성공 → step에 head
  2. 사이드 메뉴 클릭 → 모달 노출
  3. [저장 후 나가기] → PATCH 호출 → "공지" 페이지로 이동 확인

---

## 관찰 사항

**토스트 가시성 (TC3)**  
PM 미선택 시 `handleTempSave`의 에러 토스트가 모달 딤 오버레이 뒤에 가려져 사용자에게 보이지 않을 가능성이 있음. 기능적으로는 정상 동작(이탈 차단)하나, 사용자 입장에서 왜 이탈이 안 되는지 시각적 피드백이 전달되지 않을 수 있음. 별도 이슈로 다룰 필요 있음.

---

## 결론

| 항목                                    | 결과                       |
| --------------------------------------- | -------------------------- |
| 모달 제목/내용/버튼 스펙 일치           | PASS                       |
| [돌아가기] 동작                         | PASS                       |
| [저장 후 나가기] 저장 실패 시 이탈 차단 | PASS                       |
| [저장 후 나가기] 저장 성공 후 이탈      | SKIP (CORS)                |
| TypeScript 타입 오류                    | 없음 (`tsc --noEmit` 통과) |

TC1~3 PASS. TC4는 서버 환경에서 수동 검증 필요.
