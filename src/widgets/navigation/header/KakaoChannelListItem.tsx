import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import KakaoChannelLogo from "@/shared/assets/icon/kakao/KakaoChannelLogo"
import { cn } from "@/shared/lib/utils"

interface KakaoChannelListItemProps {
  label: string
  active?: boolean
  logoVariant?: "channel" | "channel-mono" | "kakao"
  onClick?: () => void
}

export default function KakaoChannelListItem({
  label,
  active = false,
  logoVariant = "channel",
  onClick,
}: KakaoChannelListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8.5 min-w-30 items-center rounded-lg px-3.5 transition-colors",
        active
          ? "justify-between bg-teal-50 pr-2.5"
          : "hover:bg-teal-gray-50 gap-1.5 bg-white",
      )}
    >
      {active ? (
        <>
          <div className="flex items-center gap-1.5">
            <KakaoChannelLogo
              variant={logoVariant}
              className="size-4 shrink-0"
            />
            <span className="text-body-2-regular tracking-[-0.14px] whitespace-nowrap text-teal-600">
              {label}
            </span>
          </div>
          <CheckIcon className="size-4 shrink-0 text-teal-600" />
        </>
      ) : (
        <>
          <KakaoChannelLogo variant={logoVariant} className="size-4 shrink-0" />
          <span className="text-body-2-regular text-teal-gray-700 tracking-[-0.14px] whitespace-nowrap">
            {label}
          </span>
        </>
      )}
    </button>
  )
}
