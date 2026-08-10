/**
 * 루트(`/`) 진입 시 어디로 보낼지.
 *
 * 로그인 여부와 역할을 가리지 않고 소개 랜딩으로 보낸다. 주소만 치고 들어온
 * 사람에게 UMC 가 무엇인지부터 보여 주는 자리다. 각자의 작업 화면은 헤더 탭으로
 * 들어간다.
 */
export const ROOT_LANDING_PATH = "/about"

/**
 * 리크루팅 영역의 기본 화면.
 *
 * 루트 진입 목적지가 아니라, 편집 권한이 없는 사람을 편집 화면에서 되돌려 보낼
 * 자리다. 읽기 권한만 있어도 볼 수 있는 화면이어야 한다.
 */
export const RECRUITING_HOME_PATH = "/recruiting/dashboard/applications"
