import { type ComponentPropsWithoutRef, forwardRef } from "react"

import SearchIcon from "@/shared/assets/icon/search/SearchIcon"
import { cn } from "@/shared/lib/utils"

export interface SearchFieldProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "className"
> {
  className?: string
  inputClassName?: string
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField({ className, inputClassName, disabled, ...props }, ref) {
    return (
      <div
        data-slot="search-field"
        className={cn(
          "shadow-inner-neutral-2 bg-teal-gray-100 flex h-11 w-full items-center gap-2 rounded-xl border border-transparent px-4 transition-colors focus-within:border-teal-400 focus-within:bg-teal-50",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <input
          {...props}
          ref={ref}
          type="text"
          disabled={disabled}
          data-slot="search-field-input"
          className={cn(
            "text-body-2-regular text-teal-gray-900 placeholder:text-teal-gray-400 min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed",
            inputClassName,
          )}
        />
        <SearchIcon
          aria-hidden="true"
          className="text-teal-gray-400 size-6 shrink-0"
        />
      </div>
    )
  },
)
