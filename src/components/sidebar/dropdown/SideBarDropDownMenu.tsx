import { SideBarDropDownMenuItem } from "./SideBarDropDownMenuItem"

interface SideBarDropDownMenuProps {
  items: string[]
  selectedIdx: number
  onSelect: (idx: number) => void
}

export function SideBarDropDownMenu({
  items,
  selectedIdx,
  onSelect,
}: SideBarDropDownMenuProps) {
  return (
    <div className="flex flex-col justify-center gap-1 rounded-[8px] bg-white p-0.5">
      {items.map((item, idx) => (
        <SideBarDropDownMenuItem
          key={item}
          label={item}
          isSelected={selectedIdx === idx}
          onClick={() => onSelect(idx)}
        />
      ))}
    </div>
  )
}
