/**
 * 루트(`/`) 진입 시 역할별로 어디로 보낼지.
 *
 * 목적지는 시즌 성격에 따라 달라진다(리크루팅 기간 / 데모데이 기간). 서버가
 * 모집 상태를 내려주기 전까지는 상수로 고정하고, 기간이 바뀌면 이 파일만 고친다.
 *
 * 현재: 리크루팅 기간
 */

/** 운영진(학교 운영진 이상)의 기본 화면 */
export const OPERATOR_LANDING_PATH = "/recruiting/dashboard/applications"

/** 일반 챌린저의 기본 화면 */
export const CHALLENGER_LANDING_PATH = "/projects"

/**
 * 비로그인 방문자의 기본 화면. 프로젝트를 먼저 둘러보게 해 유입 단계 이탈을 줄인다(#688).
 *
 * 프로젝트 목록·상세 조회의 비인증 허용이 선행돼야 한다. 그 전에는 목록이
 * 비어 보인다.
 */
export const GUEST_LANDING_PATH = "/projects"
