import UmcSymbol from "@/shared/assets/icon/logo/UmcSymbol"

export function UmcLogoButton(props: React.ComponentProps<"button">) {
  return (
    <button className="flex flex-col items-center gap-4.5" {...props}>
      <UmcSymbol className="h-12.5 text-[#3F3F3F]" />

      <p className="text-label-2-medium text-teal-gray-900 h-5">
        UNIVERSITY MAKEUS CHALLENGE
      </p>
    </button>
  )
}
