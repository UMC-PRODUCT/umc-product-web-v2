import type { SVGProps } from "react"

const KakaoLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M10.0001 1.13379C4.75303 1.13379 0.5 4.41969 0.5 8.47231C0.5 10.9927 2.14499 13.2146 4.64996 14.5361L3.59599 18.3863C3.50287 18.7265 3.89195 18.9977 4.19073 18.8005L8.81078 15.7513C9.20067 15.789 9.59689 15.8109 10.0001 15.8109C15.2467 15.8109 19.5 12.5251 19.5 8.47231C19.5 4.41969 15.2467 1.13379 10.0001 1.13379Z"
      fill="black"
    />
  </svg>
)

export default KakaoLogo
