interface SchoolChipProps {
  name: string
  logo: string
}

// 모바일 시안은 44 높이에 py 14 를 적어 두었는데 로고 28 과 합치면 56 이라 맞지
// 않는다. Figma 가 고정 높이를 우선해 패딩을 흘린 값이라, 높이에 맞는 8 로 옮긴다.
// md 부터는 14+40+14 = 68 로 떨어져 시안 값을 그대로 쓴다.
export function SchoolChip({ name, logo }: SchoolChipProps) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-2.5 rounded-[50px] bg-[rgba(255,255,255,0.1)] py-2 pr-3 pl-2 md:h-17 md:gap-3.5 md:py-3.5 md:pr-6 md:pl-4">
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white md:size-10">
        {/* 교표 21장이 합쳐 380KB 가 넘는데 모두 화면 몇 개 아래에 있다. 먼저
            받아 두면 첫 화면이 그만큼 늦어진다. */}
        <img
          src={logo}
          alt=""
          loading="lazy"
          decoding="async"
          width={40}
          height={40}
          className="size-full object-contain"
        />
      </span>
      <span className="text-lg leading-[1.4] font-semibold tracking-[-0.18px] text-[#999] md:text-2xl md:leading-[1.35] md:tracking-[-0.48px]">
        {name}
      </span>
    </div>
  )
}
