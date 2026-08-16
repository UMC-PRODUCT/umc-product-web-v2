import { ABOUT_SPONSORS } from "../../constants"
import { GlassCtaButton } from "../GlassCtaButton"

/**
 * 후원사 로고. 흰 카드 위에 얹히므로 배경을 따로 두지 않는다.
 *
 * 폭만 지정하고 높이는 비율대로 따라오게 둔다. 원본 SVG 의 viewBox 가 시안의 표시
 * 크기와 같아서 세로를 지정하지 않아도 시안 높이가 그대로 나온다.
 */
function SponsorLogo({
  name,
  logo,
  width,
}: {
  name: string
  logo: string
  width: string
}) {
  return (
    <img
      src={logo}
      alt={name}
      loading="lazy"
      decoding="async"
      className={`${width} h-auto shrink-0 object-contain`}
    />
  )
}

export function SponsorsSection() {
  return (
    <section className="flex flex-col items-center gap-10.5 pt-37.5 md:gap-18 md:pt-60 lg:pt-75">
      <div className="flex w-full flex-col items-center gap-10.5 md:gap-13">
        <div className="flex w-full flex-col items-center gap-4 md:gap-6">
          <h2 className="text-center text-[26px] leading-[1.4] font-bold tracking-[-0.52px] text-white md:text-5xl md:leading-[1.2] md:tracking-[-1.44px]">
            {ABOUT_SPONSORS.headline}
          </h2>
          <p className="text-teal-gray-400 font-suit flex flex-col text-center text-base leading-[1.5] font-light tracking-[-0.48px] md:text-2xl md:tracking-[-0.72px]">
            {ABOUT_SPONSORS.descriptionLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>

        {/* 390 에서 페이지 좌우 여백(32)을 빼면 정확히 시안 카드 폭(326)이 된다.
            360 은 그만큼 좁아지지만 페이지 전체의 좌우 리듬을 깨지 않는 쪽을 택한다. */}
        <div className="w-full max-w-[326px] rounded-[11px] bg-white px-[13px] py-[21px] md:max-w-[576px] md:rounded-[19px] md:px-6 md:py-[37px] lg:max-w-[924px] lg:rounded-[30px] lg:px-[38px] lg:py-15">
          <div className="flex flex-col items-center gap-[13px] md:gap-[22px] lg:gap-9">
            <div className="flex items-center justify-center gap-3.5 md:gap-[25px] lg:gap-10">
              {ABOUT_SPONSORS.lead.map((sponsor) => (
                <SponsorLogo key={sponsor.name} {...sponsor} />
              ))}
            </div>
            {/* 아래 4 곳은 모바일에서 2 개씩 두 줄, md 부터 한 줄이다. 안쪽 줄에
                display:contents 를 주면 로고가 바깥 줄의 직계 항목이 되어 네
                개가 같은 간격으로 늘어선다. 마크업을 구간마다 나누지 않아도 된다. */}
            <div className="flex flex-col items-center gap-[5px] md:flex-row md:justify-center md:gap-1.5 lg:gap-2.5">
              <div className="flex items-center gap-1.5 md:contents">
                {ABOUT_SPONSORS.partners.slice(0, 2).map((sponsor) => (
                  <SponsorLogo key={sponsor.name} {...sponsor} />
                ))}
              </div>
              <div className="flex items-center gap-1.5 md:contents">
                {ABOUT_SPONSORS.partners.slice(2).map((sponsor) => (
                  <SponsorLogo key={sponsor.name} {...sponsor} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 시안은 모바일에서도 CTA 를 데스크톱 크기로 두었는데, 같은 페이지의 다른
          CTA 는 모두 모바일에서 줄어든다. 시안에서 컴포넌트를 안 줄인 것으로 보고
          공용 기본값을 따른다. */}
      <GlassCtaButton href={ABOUT_SPONSORS.ctaHref}>
        {ABOUT_SPONSORS.ctaLabel}
      </GlassCtaButton>
    </section>
  )
}
