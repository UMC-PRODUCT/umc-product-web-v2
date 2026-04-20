import type { SVGProps } from "react"

const UmcLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 70 22"
    {...props}
  >
    <path
      fill="currentColor"
      d="M20.462 0H1.077C.482 0 0 .493 0 1.1V11c0 6.074 4.822 11 10.77 11 5.946 0 10.769-4.926 10.769-11V1.1C21.539.493 21.056 0 20.462 0Z"
    />
    <path
      fill="currentColor"
      d="M44.693 0c-5.352 0-9.692 3.331-9.692 8.8 0-5.469-4.34-8.8-9.693-8.8-.594 0-1.077.493-1.077 1.1v19.8c0 .607.483 1.1 1.077 1.1h19.385c.595 0 1.077-.493 1.077-1.1V1.1c0-.607-.482-1.1-1.077-1.1Z"
    />
    <path
      fill="currentColor"
      d="M70 20.9V1.1C70 .493 69.518 0 68.923 0H59.23c-5.946 0-10.769 4.926-10.769 11s4.823 11 10.77 11h9.692c.595 0 1.077-.493 1.077-1.1Z"
    />
  </svg>
)

export default UmcLogo
