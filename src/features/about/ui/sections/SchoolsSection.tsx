import { ABOUT_SCHOOLS } from "../../constants"
import { GlassCtaButton } from "../GlassCtaButton"
import { SchoolChip } from "../SchoolChip"

// 시안은 학교를 두 줄로 나눠 두고, 줄 전체 너비(2975px)가 콘텐츠 폭(1200px)을
// 넘겨 좌우로 흘러 나가게 배치한다. 앞줄을 조금 더 길게 잡는다.
const FIRST_ROW_LENGTH = Math.ceil(ABOUT_SCHOOLS.names.length / 2)
const SCHOOL_ROWS = [
  ABOUT_SCHOOLS.names.slice(0, FIRST_ROW_LENGTH),
  ABOUT_SCHOOLS.names.slice(FIRST_ROW_LENGTH),
]

export function SchoolsSection() {
  return (
    <section className="flex flex-col items-center gap-18 pt-75">
      <div className="flex w-270 flex-col items-center gap-6">
        <h2 className="text-center text-5xl leading-[1.2] font-bold tracking-[-1.44px] text-white">
          {ABOUT_SCHOOLS.headline}
        </h2>
        <p className="text-teal-gray-400 max-w-250 text-center text-2xl leading-[1.5] font-light tracking-[-0.72px]">
          {ABOUT_SCHOOLS.description}
        </p>
      </div>

      {/* TODO: 시안은 줄이 화면 밖으로 흘러 나가는 형태다. 가로로 흐르는 애니메이션
          의도인지 확정되지 않아 우선 정지 상태로 두고 가운데 정렬만 한다. */}
      <div className="flex w-full flex-col gap-7.5">
        {SCHOOL_ROWS.map((row, index) => (
          <div key={index} className="flex w-full justify-center">
            <div className="flex w-max shrink-0 items-center gap-5">
              {row.map((name) => (
                <SchoolChip key={name} name={name} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <GlassCtaButton>{ABOUT_SCHOOLS.ctaLabel}</GlassCtaButton>
    </section>
  )
}
