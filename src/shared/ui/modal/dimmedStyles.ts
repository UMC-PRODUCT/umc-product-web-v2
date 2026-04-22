import { cva, type VariantProps } from "class-variance-authority"

export const dimmedToneVariants = cva("fixed inset-0", {
  variants: {
    tone: {
      light: "bg-teal-gray-900/30",
      deep: "bg-neutral-900/85",
    },
  },
  defaultVariants: {
    tone: "deep",
  },
})

export type DimmedToneProps = VariantProps<typeof dimmedToneVariants>
