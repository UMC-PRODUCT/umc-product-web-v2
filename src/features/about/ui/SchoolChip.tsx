interface SchoolChipProps {
  name: string
  logo: string
}

export function SchoolChip({ name, logo }: SchoolChipProps) {
  return (
    <div className="flex h-17 shrink-0 items-center gap-3.5 rounded-[50px] bg-[rgba(255,255,255,0.1)] py-3.5 pr-6 pl-4">
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
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
      <span className="text-2xl leading-[1.35] font-semibold tracking-[-0.48px] text-[#999]">
        {name}
      </span>
    </div>
  )
}
