import InstagramLogo from "@/shared/assets/icon/logo/InstagramLogo"
import KakaoLogo from "@/shared/assets/icon/logo/KakaoLogo"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import UmcLogoFilled from "@/shared/assets/icon/logo/UmcLogoFilled"
import { cn } from "@/shared/lib/utils"

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
      group_1: ["PM 제옹/정의찬", "Design 삼이/이희원", "Design 시안/우자영"],
      group_2: ["iOS 원/김동민", "iOS 소피/이예지"],
      group_3: [
        "Android 조나단/조경석",
        "Android 도리/김도연",
        "Android 어헛차/박유수",
      ],
    },
  },
  {
    role: "Server",
    members: {
      group_1: ["하늘/박경운", "갈래/김민서", "와나/강하나"],
      group_2: ["우디/박성현", "세니/박세은", "박박지현/박지현"],
      group_3: ["스읍/이예은", "라미/권도희", "이람/박승범"],
    },
  },
]

const VARIANT_STYLES = {
  light: {
    bg: "bg-teal-gray-100",
    logoFilledVariant: "dark" as const,
    logoFilledColor: "text-teal-gray-300",
    primary: "text-teal-gray-400",
    secondary: "text-teal-gray-400",
    logoColor: "text-teal-gray-400",
    linkHover: "hover:text-gray-500",
  },
  dark: {
    bg: "bg-teal-gray-400",
    logoFilledVariant: "light" as const,
    logoFilledColor: "text-teal-gray-100",
    primary: "text-white",
    secondary: "text-teal-gray-100",
    logoColor: "text-teal-gray-100",
    linkHover: "hover:text-teal-gray-50",
  },
}

interface FooterProps {
  variant?: "light" | "dark"
}

export default function Footer({ variant = "light" }: FooterProps) {
  const s = VARIANT_STYLES[variant]

  return (
    <footer
      className={cn(
        "max-bp1:px-9 max-bp1:py-10 flex flex-col items-center gap-2.5 self-stretch py-16 pr-14 pl-15",
        s.bg,
      )}
    >
      <div className="flex flex-col items-start gap-6 self-stretch">
        <div className="flex w-full justify-between gap-4 max-[930px]:flex-col">
          <div className="flex min-w-0 items-center gap-4">
            <UmcLogoFilled
              variant={s.logoFilledVariant}
              className={cn("h-5.5 w-auto shrink-0", s.logoFilledColor)}
            />
            <span className={cn("text-heading-7-semibold", s.primary)}>
              University MakeUs Challenge
            </span>
          </div>
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 pt-1 whitespace-nowrap max-[930px]:items-start",
              s.primary,
            )}
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <nav
                aria-label="약관 및 정책"
                className="flex items-center gap-6"
              >
                <a
                  href="https://makeus-challenge.notion.site/300b57f4596b8018a2dfd38784478715"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-body-3-regular transition-colors hover:underline",
                    s.linkHover,
                  )}
                >
                  서비스이용약관
                </a>
                <a
                  href="https://makeus-challenge.notion.site/300b57f4596b803f8c94dd4f4fb71960"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-body-3-regular transition-colors hover:underline",
                    s.linkHover,
                  )}
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
            className={cn("text-subtitle-4-semibold", s.secondary)}
          >
            UMC PRODUCT
          </h2>
          <dl className="mt-4 flex flex-col gap-1.75">
            {TEAM_ROWS.map(({ role, members }) => (
              <div
                key={role}
                className={cn("flex items-baseline gap-2.25", s.secondary)}
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
                  <div className="text-body-3-regular flex shrink-0 flex-wrap gap-x-2.5 gap-y-0.5 tracking-[-0.02em]">
                    {members.group_1.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                  <div className="max-bp1:flex-col flex gap-1.5">
                    {members.group_2 && (
                      <div className="text-body-3-regular flex shrink-0 flex-wrap gap-x-2.5 gap-y-0.5 tracking-[-0.02em]">
                        {members.group_2.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    )}
                    {members.group_3 && (
                      <div className="text-body-3-regular flex shrink-0 flex-wrap gap-x-2.5 gap-y-0.5 tracking-[-0.02em]">
                        {members.group_3.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
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
            <UmcLogo className={cn("h-3 w-auto", s.logoColor)} />
            <a
              href="https://apps.apple.com/kr/app/umc/id6759412446"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-body-3-medium transition-colors hover:underline",
                s.secondary,
                s.linkHover,
              )}
            >
              iOS
            </a>
            <span className={cn("text-body-3-medium", s.secondary)}>/</span>
            <a
              href="https://play.google.com/store/apps/details?id=com.umc.product&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-body-3-medium transition-colors hover:underline",
                s.secondary,
                s.linkHover,
              )}
            >
              Android
            </a>
            <a
              href="https://tech.university.neordinary.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-body-3-medium flex items-center gap-1.75 transition-colors",
                s.secondary,
                s.linkHover,
              )}
            >
              <UmcLogo className="ml-4 h-3 w-auto" />
              <span className="hover:underline">Product Tech</span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/uni_makeus_challenge/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-body-3-medium flex items-center gap-1.75 transition-colors",
                s.secondary,
                s.linkHover,
              )}
            >
              <InstagramLogo className="size-4" />
              <span className="hover:underline">Instagram</span>
            </a>
            <a
              href="https://pf.kakao.com/_MDxhqX/chat"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-body-3-medium flex items-center gap-1.75 transition-colors",
                s.secondary,
                s.linkHover,
              )}
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
