import { OptionButton } from "@/shared/ui/option-button/OptionButton"
import { OptionButtonGroup } from "@/shared/ui/option-button/OptionButtonGroup"

import { type Branch, BRANCHES } from "../model/matchingRoundMock"

interface BranchSelectorProps {
  selected: Branch
  onChange: (branch: Branch) => void
  className?: string
}

export function BranchSelector({
  selected,
  onChange,
  className,
}: BranchSelectorProps) {
  return (
    <OptionButtonGroup
      type="single"
      variant="segmented"
      value={selected}
      onValueChange={(v) => {
        if (v) onChange(v as Branch)
      }}
      className={className}
    >
      {BRANCHES.map((branch) => (
        <OptionButton key={branch} value={branch}>
          {branch}
        </OptionButton>
      ))}
    </OptionButtonGroup>
  )
}
