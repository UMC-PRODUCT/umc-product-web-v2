interface SchoolChipProps {
  name: string
}

export function SchoolChip({ name }: SchoolChipProps) {
  return (
    <div className="flex h-17 shrink-0 items-center gap-3.5 rounded-[50px] bg-[rgba(255,255,255,0.1)] py-3.5 pr-6 pl-4">
      {/* 시안의 로고 자리는 채워진 사각형이다. 학교 로고 에셋을 따로 넣지 않기로
          해서(2026-08-06 결정) 그 상태를 그대로 쓴다. */}
      <span
        aria-hidden
        className="size-10 shrink-0 rounded-[10px] bg-teal-900"
      />
      <span className="text-2xl leading-[1.35] font-semibold tracking-[-0.48px] text-[#999]">
        {name}
      </span>
    </div>
  )
}
