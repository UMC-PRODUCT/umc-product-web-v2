/**
 * 루트(`/`) 진입 시 어디로 보낼지.
 *
 * 역할과 상관없이 프로젝트 목록으로 보낸다. 운영진도 로그인하면 먼저 프로젝트를
 * 보고, 리크루팅은 헤더 탭으로 들어간다.
 */

/** 일반 챌린저의 기본 화면 */
export const CHALLENGER_LANDING_PATH = "/projects"

/**
 * 비로그인 방문자의 기본 화면. 프로젝트를 먼저 둘러보게 해 유입 단계 이탈을 줄인다(#688).
 *
 * 프로젝트 목록·상세 조회의 비인증 허용이 선행돼야 한다. 그 전에는 목록이
 * 비어 보인다.
 */
export const GUEST_LANDING_PATH = "/projects"

/**
 * 리크루팅 영역의 기본 화면.
 *
 * 루트 진입 목적지가 아니라, 편집 권한이 없는 사람을 편집 화면에서 되돌려 보낼
 * 자리다. 읽기 권한만 있어도 볼 수 있는 화면이어야 한다.
 */
export const RECRUITING_HOME_PATH = "/recruiting/dashboard/applications"
