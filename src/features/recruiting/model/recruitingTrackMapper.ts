import type { PartTag } from "@/shared/model/domain"

export function mapTrackToPartTag(track?: string | null): PartTag | null {
  if (!track) return null
  switch (track) {
    case "PLAN":
      return "plan"
    case "DESIGN":
      return "design"
    case "WEB_PRODUCT_ENGINEER":
    case "WEB":
      return "web-pe"
    case "MOBILE_PRODUCT_ENGINEER":
      return "mobile-pe"
    case "INFRA_PLUS":
    case "SPRING_BOOT":
      return "springboot"
    case "NODE_JS":
      return "nodejs"
    case "IOS":
      return "ios"
    case "ANDROID":
      return "android"
    default:
      return null
  }
}
