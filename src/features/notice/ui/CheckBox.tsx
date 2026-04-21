import CheckBoxIcon from "@/shared/assets/icon/check/CheckBoxIcon"

interface CheckBoxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function CheckBox({ checked, onCheckedChange }: CheckBoxProps) {
  const handleClick = () => {
    onCheckedChange(!checked)
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={handleClick}
      className="flex h-5 w-5 items-center justify-center"
    >
      {checked ? (
        <CheckBoxIcon />
      ) : (
        <div className="border-teal-gray-400 box-border h-5 w-5 rounded-[6px] border-[1.5px] bg-white" />
      )}
    </button>
  )
}
