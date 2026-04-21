import { createContext, useContext } from "react"

interface OptionButtonGroupContextValue {
  value: string | undefined
  onSelect: (value: string) => void
  variant: "separate" | "segmented"
}

export const OptionButtonGroupContext =
  createContext<OptionButtonGroupContextValue | null>(null)

export function useOptionButtonGroupContext() {
  return useContext(OptionButtonGroupContext)
}
