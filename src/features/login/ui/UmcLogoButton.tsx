import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"

export function UmcLogoButton(props: React.ComponentProps<"button">) {
  return (
    <button className="flex flex-col items-center gap-4.5" {...props}>
      <UmcLogo className="h-12.5" />

      <p className="text-label-2-medium text-teal-gray-900 h-5">
        UNIVERSITY MAKEUS CHALLENGE
      </p>
    </button>
  )
}
