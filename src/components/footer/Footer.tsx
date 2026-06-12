import InstagramLogo from "@/shared/assets/icon/logo/InstagramLogo"
import KakaoLogo from "@/shared/assets/icon/logo/KakaoLogo"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import UmcLogoFilled from "@/shared/assets/icon/logo/UmcLogoFilled"

const TEAM_ROWS = [
  { role: "Lead", members: { group_1: ["리버/이재원", "우연/추연우"] } },
  {
    role: "Web",
    members: {
      group_1: ["PM 벨라/황지원", "Design 이방토/이예원"],
      group_2: ["FE 이삭/강지훈", "FE 헤일리/한현서"],
      group_3: ["FE 주디/양혜원", "FE 준오/오창준"],
    },
  },
  {
    role: "Mobile",
    members: {
      group_1: ["PM 제용/정의찬", "Design 삼이/이희원", "Design 시안/우자영"],
      group_2: ["FE 원/김동민", "FE 도도/김도연", "FE 소피/이예지"],
      group_3: ["FE 도리/김도연", "FE 어핫차/박유수"],
    },
  },
  {
    role: "Server",
    members: {
      group_1: ["하늘/박경운", "와나/강하나", "커너/박성현"],
      group_2: ["세니/박세은", "박박지현/박지현", "스읍/이예은"],
      group_3: ["라미/권도희", "이람/박승범"],
    },
  },
]

export default function Footer() {
  return (
    <footer className="bg-teal-gray-100 flex flex-col items-center gap-2.5 self-stretch px-5 py-10">
      <div className="flex flex-col items-start gap-6 self-stretch">
        <div className="flex w-full justify-between gap-4 max-[930px]:flex-col">
          <div className="flex items-center gap-4">
            <UmcLogoFilled className="text-teal-gray-300 h-5.5 w-auto shrink-0" />
            <span className="text-heading-7-semibold text-teal-gray-400 shrink-0">
              University Make us Challenge
            </span>
          </div>
          <div className="text-teal-gray-400 flex flex-col items-center justify-center gap-2 pt-1 whitespace-nowrap max-[930px]:items-start">
            <div className="flex items-center gap-6">
              <nav
                aria-label="약관 및 정책"
                className="flex items-center gap-6"
              >
                <a
                  href="https://makeus-challenge.notion.site/300b57f4596b8018a2dfd38784478715"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-3-regular transition-colors hover:text-gray-500 hover:underline"
                >
                  서비스이용약관
                </a>
                <a
                  href="https://makeus-challenge.notion.site/300b57f4596b803f8c94dd4f4fb71960"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-3-regular transition-colors hover:text-gray-500 hover:underline"
                >
                  개인정보처리방침
                </a>
              </nav>
              <small className="text-body-3-regular">
                © 2026 UMC All rights reserved.
              </small>
            </div>
          </div>
        </div>

        <section aria-labelledby="footer-team-heading" className="w-full">
          <h2
            id="footer-team-heading"
            className="text-subtitle-4-semibold text-teal-gray-400"
          >
            UMC Product
          </h2>
          <dl className="mt-4 flex flex-col gap-1.75">
            {TEAM_ROWS.map(({ role, members }) => (
              <div
                key={role}
                className="text-teal-gray-400 flex items-baseline gap-2.25"
              >
                <dt className="flex gap-2.25">
                  <span className="text-body-3-medium w-10 shrink-0">
                    {role}
                  </span>
                  <span className="text-body-3-regular" aria-hidden="true">
                    |
                  </span>
                </dt>
                <dd className="flex gap-2.25 max-[930px]:flex-col max-[930px]:gap-1">
                  <div className="text-body-3-regular shrink-0 tracking-[-0.02em]">
                    {members.group_1.join("   ")}
                  </div>
                  <div className="max-bp1:flex-col flex gap-1.5">
                    {members.group_2 && (
                      <div className="text-body-3-regular shrink-0 tracking-[-0.02em]">
                        {members.group_2.join("   ")}
                      </div>
                    )}
                    {members.group_3 && (
                      <div className="text-body-3-regular shrink-0 tracking-[-0.02em]">
                        {members.group_3.join("   ")}
                      </div>
                    )}
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <nav
          aria-label="앱 다운로드 및 소셜 미디어"
          className="max-bp1:flex-col max-bp1:items-center flex w-full flex-wrap items-center gap-x-6 gap-y-3"
        >
          <div className="flex items-center gap-1.75">
            <UmcLogo className="text-teal-gray-400 h-3 w-auto" />
            <a
              href="https://apps.apple.com/kr/app/umc/id6759412446"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-3-medium text-teal-gray-400 transition-colors hover:text-gray-500 hover:underline"
            >
              iOS
            </a>
            <span className="text-body-3-medium text-teal-gray-400">/</span>
            <a
              href="https://play.google.com/store/apps/details?id=com.umc.product&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-3-medium text-teal-gray-400 transition-colors hover:text-gray-500 hover:underline"
            >
              Android
            </a>
            <a
              href="https://tech.university.neordinary.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-3-medium text-teal-gray-400 flex items-center gap-1.75 transition-colors"
            >
              <UmcLogo className="ml-4 h-3 w-auto" />
              <span className="hover:text-gray-500 hover:underline">
                Product Tech
              </span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/uni_makeus_challenge/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-3-medium text-teal-gray-400 flex items-center gap-1.75 transition-colors hover:text-gray-500"
            >
              <InstagramLogo className="size-4" />
              <span className="hover:underline">Instagram</span>
            </a>
            <a
              href="https://pf.kakao.com/_MDxhqX/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-3-medium text-teal-gray-400 flex items-center gap-1.75 transition-colors hover:text-gray-500"
            >
              <KakaoLogo className="size-4" />
              <span className="hover:underline">Kakao</span>
            </a>
          </div>
        </nav>
      </div>
    </footer>
  )
}
