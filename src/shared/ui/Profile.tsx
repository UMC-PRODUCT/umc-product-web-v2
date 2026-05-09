import { useState } from "react"

import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import { cn } from "@/shared/lib/utils"

import { ProfileDropdown } from "./ProfileDropdown"

interface ProfileProps {
  size?: number
  src?: string | null
  className?: string
}

export default function Profile({ size = 40, src, className }: ProfileProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string | undefined>()

  const handleSelect = (value: string) => {
    setSelectedValue(value)
    // TODO: Handle menu item selection
  }

  return (
    <ProfileDropdown
      open={isOpen}
      onOpenChange={setIsOpen}
      selectedValue={selectedValue}
      onSelect={handleSelect}
      triggerClassName={cn(
        "shrink-0 overflow-hidden rounded-full transition-opacity hover:opacity-80",
        className,
      )}
      triggerStyle={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="profile" className="size-full object-cover" />
      ) : (
        <ProfileIcon className="size-full" />
      )}
    </ProfileDropdown>
  )
}
