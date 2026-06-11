import InstagramLogo from "@/shared/assets/icon/logo/InstagramLogo"
import KakaoLogo from "@/shared/assets/icon/logo/KakaoLogo"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"

const TEAM_ROWS = [
  { role: "Lead", members: ["리버/이재원", "우연/추연우"] },
  {
    role: "Web",
    members: [
      "PM 벨라/황지원",
      "Design 이방토/이예원",
      "FE 이삭/강지훈",
      "FE 헤일리/한현서",
      "FE 주디/양혜원",
      "FE 준오/오창준",
    ],
  },
  {
    role: "Mobile",
    members: [
      "PM 제용/정의찬",
      "Design 삼이/이희원",
      "Design 시안/우자영",
      "FE 원/김동민",
      "FE 도도/김도연",
      "FE 소피/이예지",
      "FE 도리/김도연",
      "FE 어핫차/박유수",
    ],
  },
  {
    role: "Server",
    members: [
      "하늘/박경운",
      "와나/강하나",
      "커너/박성현",
      "세니/박세은",
      "박박지현/박지현",
      "스읍/이예은",
      "라미/권도희",
      "이람/박승범",
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-teal-gray-600 flex flex-col items-center gap-2.5 self-stretch px-5 py-10 min-[930px]:pt-16 min-[930px]:pr-14 min-[930px]:pb-16 min-[930px]:pl-15">
      <div className="flex flex-col items-start gap-6 self-stretch min-[930px]:gap-8.5">
        <div className="flex w-full flex-col gap-4 min-[930px]:flex-row min-[930px]:items-center min-[930px]:justify-between">
          <div className="flex items-center gap-4">
            <UmcLogo className="h-5.5 w-auto text-white" />
            <span className="text-heading-7-semibold min-[930px]:text-heading-6-semibold text-white">
              University Make us Challenge
            </span>
          </div>
          <div className="text-teal-gray-200 flex flex-col items-end gap-2 min-[930px]:flex-row min-[930px]:items-center min-[930px]:gap-6">
            <div className="flex items-center gap-6">
              <a
                href="https://makeus-challenge.notion.site/300b57f4596b8018a2dfd38784478715"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-3-regular min-[930px]:text-body-2-regular transition-colors hover:text-white"
              >
                서비스이용약관
              </a>
              <a
                href="https://makeus-challenge.notion.site/300b57f4596b803f8c94dd4f4fb71960"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-3-regular min-[930px]:text-body-2-regular transition-colors hover:text-white"
              >
                개인정보처리방침
              </a>
            </div>
            <span className="text-body-3-regular min-[930px]:text-body-2-regular">
              © 2026 UMC All rights reserved.
            </span>
          </div>
        </div>

        <div className="w-full">
          <p className="text-subtitle-4-semibold text-white">
            UMC Official Product Team
          </p>
          <div className="mt-4 flex flex-col gap-1.75">
            {TEAM_ROWS.map(({ role, members }) => (
              <div key={role} className="flex items-baseline gap-2.25">
                <span className="text-body-3-medium min-[930px]:text-body-2-medium w-11 shrink-0 text-white">
                  {role}
                </span>
                <span className="text-body-3-regular min-[930px]:text-body-2-regular text-teal-gray-200">
                  |
                </span>
                <span className="text-body-3-regular min-[930px]:text-body-2-regular text-teal-gray-200 tracking-[-0.02em]">
                  {members.join("   ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-1.75">
            <UmcLogo className="text-teal-gray-200 h-3 w-auto" />
            <a
              href="https://apps.apple.com/kr/app/umc/id6759412446"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-3-medium min-[930px]:text-body-2-medium text-teal-gray-200 transition-colors hover:text-white hover:underline"
            >
              iOS
            </a>
            <span className="text-body-3-medium min-[930px]:text-body-2-medium text-teal-gray-200">
              /
            </span>
            <a
              href="https://play.google.com/store/apps/details?id=com.umc.product&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-3-medium min-[930px]:text-body-2-medium text-teal-gray-200 transition-colors hover:text-white hover:underline"
            >
              Android
            </a>
          </div>
          <a
            href="https://tech.university.neordinary.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-3-medium min-[930px]:text-body-2-medium text-teal-gray-200 flex items-center gap-1.75 transition-colors hover:text-white"
          >
            <UmcLogo className="h-3 w-auto" />
            <span>Product Tech</span>
          </a>
          <a
            href="https://www.instagram.com/uni_makeus_challenge/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-3-medium min-[930px]:text-body-2-medium text-teal-gray-200 flex items-center gap-1.75 transition-colors hover:text-white"
          >
            <InstagramLogo className="size-4" />
            <span>Instagram</span>
          </a>
          <a
            href="https://pf.kakao.com/_MDxhqX/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-3-medium min-[930px]:text-body-2-medium text-teal-gray-200 flex items-center gap-1.75 transition-colors hover:text-white"
          >
            <KakaoLogo className="size-4" />
            <span>Kakao</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
