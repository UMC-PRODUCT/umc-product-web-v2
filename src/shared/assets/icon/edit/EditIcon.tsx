import type { SVGProps } from "react"

const EditIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_edit_icon)">
      <path
        d="M7 4L1.14645 9.85355C1.05268 9.94732 1 10.0745 1 10.2071V14.5C1 14.7761 1.22386 15 1.5 15H5.79289C5.9255 15 6.05268 14.9473 6.14645 14.8536L12 9M7 4L9.64645 1.35355C9.84171 1.15829 10.1583 1.15829 10.3536 1.35355L14.6464 5.64645C14.8417 5.84171 14.8417 6.15829 14.6464 6.35355L12 9M7 4L12 9M9 15H15"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_edit_icon">
        <rect width={16} height={16} fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export default EditIcon
