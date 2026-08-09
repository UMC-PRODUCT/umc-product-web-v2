import { ABOUT_POSSIBILITY } from "../../constants"
import { StatCard } from "../StatCard"

export function PossibilitySection() {
  return (
    <section className="flex flex-col items-center gap-40 pt-60 lg:pt-75">
      <div className="flex w-full flex-col items-center gap-16">
        <div className="flex w-full flex-col items-center gap-6">
          <h2 className="text-center text-[32px] leading-[1.2] font-bold tracking-[-0.64px] text-white lg:text-[38px] lg:tracking-[-0.76px] xl:text-5xl xl:tracking-[-1.44px]">
            {ABOUT_POSSIBILITY.headline}
          </h2>
          <p className="text-teal-gray-400 w-full text-center text-[22px] leading-[1.5] font-light tracking-[-0.66px] xl:text-2xl xl:tracking-[-0.72px]">
            {ABOUT_POSSIBILITY.description}
          </p>
        </div>

        <div className="flex h-44.5 w-full items-center gap-4 px-4 lg:h-52.5 xl:gap-8 xl:px-0">
          {ABOUT_POSSIBILITY.stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <dl className="flex flex-col items-start gap-16 pl-10 lg:gap-20 lg:pl-22 xl:pl-8">
        {ABOUT_POSSIBILITY.values.map((value) => (
          <div
            key={value.keyword}
            className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:gap-8"
          >
            <dt className="w-18 text-center text-[42px] leading-[50px] font-extrabold tracking-[-1px] text-teal-300">
              {value.keyword}
            </dt>
            <dd className="text-teal-gray-300 flex flex-col text-[22px] leading-[1.5] font-light tracking-[-0.66px] lg:text-2xl lg:tracking-[-0.72px]">
              {value.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
