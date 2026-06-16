# Changelog

이 프로젝트의 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며, 버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

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

### Fixed (수정)

- **DRAFT 등록·검토 흐름** — 수정하기로 진입한 DRAFT도 등록 시 submit해 PENDING_REVIEW로 전이, submit 전 gisuId 보장, submit 성공/이후 draft 쿼리 캐시 무효화
- **GA4 정확도** — `initializeAnalytics` 1회 실행 보장, web-vitals 리스너를 measurementId 미설정 시 생략, `route_error` 트래킹을 useEffect로 이동해 렌더 부작용 제거, 필터만으로 결과가 빈 경우도 `project_empty_result` 추적, 중복 `application_form_start` 제거
- **헤더·내비게이션** — active 판단 시 접두사 충돌 방지, `/matching` 하위 경로 active 미적용 수정, 헤더 프로필 이미지 누락 수정
- **로고·디자인** — 프로젝트 관리 카드 로고 잘림 해결, UmcLogoFilled light variant fill을 currentColor로 수정, 푸터 브랜드명 표기를 University MakeUs Challenge로 수정, 푸터 하단 링크 수직 정렬 보정 및 블로그 링크 라벨(Product Blog) 수정
- **소개 페이지 디테일** — Painpoint 글로우를 연속 배경 레이어로 옮겨 섹션 경계 이음매 제거, FAQ 상단 오버레이 페이드 보정, 소개 페이지·푸터 팀 멤버 표기 정합성 수정
- **매칭·프로젝트** — 매칭 기간 지부 기준 수정, `useIsMatchingPeriod` 명시적 `chapterId=undefined` 시 fallback 차단, 프로젝트 기본 정보 링크 초기화 보정, 지원 현황 페이지 불필요한 API 호출 제거

### Removed (제거)

- 미사용 `Favicon` SVG 컴포넌트 제거 (브라우저 탭 파비콘은 정적 `/favicon.svg` 사용)

### Security (보안)

- **PII 유출 방지** — GA4 `page_view`의 `page_path`·`referrer` 및 `getCurrentPagePath`에서 쿼리스트링 제외

### Accessibility (접근성)

- 스크롤 스냅에 `prefers-reduced-motion` 가드 추가

## [1.0.0] - 2026-06-14

UMC 데모데이 매칭 시스템 첫 공식 릴리스.

[1.1.0]: https://github.com/UMC-PRODUCT/umc-product-web-v2/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/UMC-PRODUCT/umc-product-web-v2/releases/tag/v1.0.0
