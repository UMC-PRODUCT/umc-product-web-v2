# Changelog

이 프로젝트의 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며, 버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [1.1.4] - 2026-06-18

공지 기능 보강과 함께 지원현황 조회 권한을 정정하고, 내 정보·활성 기수 조회 캐싱 구조와 프로젝트 목록 필터링 상태 관리를 정리한 배포입니다.

### Added (추가)

- **기본 공지 audience 필터링 추가** — 대상(audience)에 따라 기본 공지를 분리해 노출

### Changed (변경)

- **프로젝트 목록 필터링 상태를 URL Query Param에 연동** — 필터 상태를 URL로 공유·복원 가능하도록 정리
- 중복 호출되던 권한 판단 함수를 기정의 변수로 대체하고 `gisuKeys` 중복 정의 제거 등 타입 안전성·구조 정리

### Performance (성능)

- **내 정보·활성 기수 조회 API 캐싱 구조 최적화** — 공용 `queryOptions` 적용으로 중복 요청 감소

### Fixed (수정)

- **지부장/회장단 및 최고관리자의 지원현황 조회 권한 수정**

## [1.1.3] - 2026-06-18

프로젝트 등록·수정 흐름과 지원·매칭 권한 판정의 안정화를 중심으로 한 배포입니다. 등록/수정 라우트를 분리하고, 라우트별 SEO 메타와 공개 페이지 prerender 파이프라인을 추가했으며, 복합 권한 계정의 지원 CTA 판정을 정정합니다.

### Added (추가)

- **프로젝트 등록/수정 라우트 분리** — `/new`·`/edit`로 진입을 분리하고 DRAFT 진입 흐름을 정리
- **라우트별 SEO 메타 적용 및 공유 유틸 추가**, 공개 페이지 prerender 빌드 파이프라인 추가
- **매칭 기간 중 진행 프로젝트 수정 진입 가드** 추가

### Changed (변경)

- **챌린저 파트 판정을 현재 뷰·현재 기수 기준으로 정합화** — 과거 기수 폴백 제거, 파트 판정 타입을 API 유니온 타입으로 통일
- 지원 CTA의 PM 방어 분기를 제거하고 렌더링·클릭 핸들러를 단순화

### Performance (성능)

- grouped view에서 불필요한 `getMyDraft` 호출 비활성화

### Fixed (수정)

- **복합 권한 계정의 지원 CTA 판정 보정** 및 매칭 프로젝트 지원 불가 시 비활성 지원 버튼 노출 제거
- 내 지원서 조회에 인증 사용자 조건 추가
- **GA4 gtag 이벤트 전송 복구**(arguments 객체 push) 및 `page_view` 경로를 `:id`로 정규화해 동적 라우트 분산 집계 방지
- 프로젝트 목록 필터 드롭다운 overflow 클리핑 수정
- DRAFT 로딩 중 제출 버튼 비활성화, 토스트 메시지 교정
- 프로젝트 중단의 복구 불가성을 메뉴·모달에 명시

## [1.1.1] - 2026-06-17

v1.1.0 이후 develop에 누적된 변경을 배포합니다. 소개 랜딩 페이지 시각 정비와 성능 최적화, 프로젝트 등록·관리 흐름의 버그 수정이 주요 변경입니다.

### Changed (변경)

- **소개 랜딩 페이지 시각 정비** — 와이드 풀블리드 배경·Solution 글로우 CSS 전환, FAQ·FlowSteps 카드 디자인 정합 및 글래스 효과, 라이트 영역 글로우 오버레이 분리·엣지 페이드로 풀블리드 경계 정리
- **전역 오버스크롤 바운스·스크롤 체이닝 제거**
- **관리 프로젝트 조회에 페이지네이션 적용**
- 인트로 스크롤 스냅 로직 제거

### Performance (성능)

- **`/intro` 이미지 WebP 변환·지연 로딩 최적화**
- **인증 SDK 지연 로드**로 비로그인 페이지 경량화

### Fixed (수정)

- **프로젝트 관리 그룹뷰에서 비FE·미설정 프로젝트 미노출 수정** — Web/iOS/Android 외 파트만 모집하거나 정원 미설정 프로젝트를 '미분류' 그룹으로 노출
- **임시저장 프로젝트 수정 시 검토 대기로 전환되지 않던 오류** 및 캐시로 검토 대기 전이가 누락되던 오류 수정
- **프로젝트 등록 시 탭 이동할 때 입력한 기본 정보가 유실되던 오류** 수정
- 임시저장 프로젝트 수정 시 최종 단계 버튼·성공 모달 문구를 '등록' 기준으로 노출
- 이미지 업로드 시 다중 상태 업데이트·리렌더링 발생 수정
- 사파리 관성 스크롤로 매칭 페이지네이션이 점프하던 현상 방지 및 매뉴얼 페이지네이션 버벅임 제거
- 소개 메뉴를 `/intro` 하위 경로에서도 active 유지
- 서버 팀 명단 줄 간격 수정

## [1.1.0] - 2026-06-16

v1.0.0 이후 develop에 누적된 변경을 배포합니다. 데모데이 소개 랜딩 페이지와 SEO 기반, GA4 기반 프론트 관측, 로그인 returnTo 인증 플로우, 프로젝트 DRAFT 검토 흐름이 주요 변경입니다.

### Added (추가)

- **데모데이 소개 랜딩 페이지(`/intro`) 신규 구현** — 히어로·페인포인트·FAQ·ProductTeam 섹션 및 라우트 전환 뷰 트랜지션 애니메이션
- **SEO 기반 마련** — OG·JSON-LD 메타데이터와 route head 동적 메타, `robots.txt`·`sitemap`·OG 공유 이미지 추가
- **GA4 기반 프론트 관측 지표** — `page_view`·`route_error`·web-vitals·지원 폼 퍼널(`application_form_start`) 등 이벤트 트래킹
- **로그인 returnTo 인증 플로우** — 보호된 라우트 진입 시 원래 목적지로 복귀하는 returnTo 리다이렉트 유틸 적용 및 보호 라우트에 `location.href` 전달
- **프로젝트 관리 DRAFT 검토 요청 버튼** — 관리 메뉴에서 DRAFT를 검토 요청(PENDING_REVIEW)으로 전이
- **UmcLogoFilled light/dark variant 통합** 및 Footer dark variant 추가

### Changed (변경)

- **루트(`/`) 진입을 소개 페이지로 전환**하고 공용 헤더 내비게이션 정비
- **헤더 "소개" 메뉴 임시 비활성화** — 클릭 시 안내 토스트만 노출하고 페이지 이동 차단(`/intro`는 URL 직접 접근만 가능). 비활성 메뉴 안내 문구는 항목별 `disabledMessage`로 관리
- canonical 링크를 정적 `index.html`에서 route head로 이전
- 내비게이션 버튼을 `Link`로 복원해 링크 시맨틱 유지
- 권한별 지원 현황 뷰 조정 — SCHOOL_PRESIDENT 지원자 목록 펼치기 버튼 숨김, SCHOOL_VICE_PRESIDENT 뷰를 Others로 변경
- **학교 부회장(SCHOOL_VICE_PRESIDENT) 지원 현황 권한 정교화** — 소속 지부의 지원 현황은 열람하되 지원자 목록은 볼 수 없도록 제한하고, 학교 통계는 학교 회장만 확인하도록 분리
- **이미지 fallback 처리 통일** — 프로젝트 로고·썸네일 컴포넌트가 이미지 미등록/로드 실패 시 동일한 fallback을 노출하도록 정리

### Fixed (수정)

- **DRAFT 등록·검토 흐름** — 수정하기로 진입한 DRAFT도 등록 시 submit해 PENDING_REVIEW로 전이, submit 전 gisuId 보장, submit 성공/이후 draft 쿼리 캐시 무효화
- **GA4 정확도** — `initializeAnalytics` 1회 실행 보장, web-vitals 리스너를 measurementId 미설정 시 생략, `route_error` 트래킹을 useEffect로 이동해 렌더 부작용 제거, 필터만으로 결과가 빈 경우도 `project_empty_result` 추적, 중복 `application_form_start` 제거
- **헤더·내비게이션** — active 판단 시 접두사 충돌 방지, `/matching` 하위 경로 active 미적용 수정, 헤더 프로필 이미지 누락 수정
- **로고·디자인** — 프로젝트 관리 카드 로고 잘림 해결, UmcLogoFilled light variant fill을 currentColor로 수정, 푸터 브랜드명 표기를 University MakeUs Challenge로 수정, 푸터 하단 링크 수직 정렬 보정 및 블로그 링크 라벨(Product Blog) 수정
- **소개 페이지 디테일** — Painpoint 글로우를 연속 배경 레이어로 옮겨 섹션 경계 이음매 제거, FAQ 상단 오버레이 페이드 보정, 소개 페이지·푸터 팀 멤버 표기 정합성 수정
- **매칭·프로젝트** — 매칭 기간 지부 기준 수정, `useIsMatchingPeriod` 명시적 `chapterId=undefined` 시 fallback 차단, 프로젝트 기본 정보 링크 초기화 보정, 지원 현황 페이지 불필요한 API 호출 제거
- **지원·모집 문항 모달** — 모집 문항 보기/지원서 작성/내 지원서 보기에서 질문 설명(caption) 표시, 지원 관련 모달 타이틀 카드·내 지원 현황 카드·프로젝트 타이틀 카드에 로고·대표 이미지가 없을 때 fallback 노출
- **지원·매칭 현황 통계** — 학교 회장단 지원 현황 총원을 지부 전체 기준으로 집계(첫 로딩 시 총원이 0으로 깜빡이던 현상 포함), 매칭 현황 총원을 라운드 공개 여부와 무관하게 표시, 지원률 분모를 지원 가능 인원 기준으로 표기

### Removed (제거)

- 미사용 `Favicon` SVG 컴포넌트 제거 (브라우저 탭 파비콘은 정적 `/favicon.svg` 사용)

### Security (보안)

- **PII 유출 방지** — GA4 `page_view`의 `page_path`·`referrer` 및 `getCurrentPagePath`에서 쿼리스트링 제외

### Accessibility (접근성)

- 스크롤 스냅에 `prefers-reduced-motion` 가드 추가

## [1.0.0] - 2026-06-14

UMC 데모데이 매칭 시스템 첫 공식 릴리스.

[1.1.4]: https://github.com/UMC-PRODUCT/umc-product-web-v2/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/UMC-PRODUCT/umc-product-web-v2/compare/v1.1.2...v1.1.3
[1.1.0]: https://github.com/UMC-PRODUCT/umc-product-web-v2/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/UMC-PRODUCT/umc-product-web-v2/releases/tag/v1.0.0
