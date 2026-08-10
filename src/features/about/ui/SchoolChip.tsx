interface SchoolChipProps {
  name: string
  logo: string
}

export function SchoolChip({ name, logo }: SchoolChipProps) {
  return (
    <div className="flex h-17 shrink-0 items-center gap-3.5 rounded-[50px] bg-[rgba(255,255,255,0.1)] py-3.5 pr-6 pl-4">
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
        {/* 교표 21장이 합쳐 380KB 가 넘는데 모두 화면 몇 개 아래에 있다. 먼저
            받아 두면 첫 화면이 그만큼 늦어진다. */}
        <img
          src={logo}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-contain"
        />
      </span>
      <span className="text-2xl leading-[1.35] font-semibold tracking-[-0.48px] text-[#999]">
        {name}
      </span>
    </div>
  )
}
